import "reflect-metadata"
import "@/shared/container"
import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";
import { validatorCompiler, serializerCompiler, type ZodTypeProvider, jsonSchemaTransform } from "fastify-type-provider-zod";
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { routes } from "./shared/infra/http/routes";
import { AppDataSource } from "./shared/infra/database"
import { requestLogger } from "./shared/middlewares/requestLogger";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Adicionar middleware de logging global
app.addHook('onRequest', requestLogger);

// Configuração de CORS com base nos domínios permitidos do .env
const allowedDomainsString = process.env.ALLOWED_DOMAINS || "";
const allowedDomains = allowedDomainsString ? allowedDomainsString.split(',').map(domain => domain.trim()) : [];

// Log dos domínios permitidos
console.log("===== CORS Configuration =====");
console.log("Allowed domains:", allowedDomains);
console.log("Environment variable ALLOWED_DOMAINS:", process.env.ALLOWED_DOMAINS);
console.log("=============================");

// Verificar se os domínios com wildcard estão corretamente formatados
// Estamos usando essa abordagem porque muitas vezes erros de CORS
// ocorrem devido à má formatação dos domínios
for (const domain of allowedDomains) {
  if (domain.startsWith('*.')) {
    const suffix = domain.substring(1);
    if (!suffix.startsWith('.')) {
      console.warn(`WARN: Wildcard domain '${domain}' might be incorrectly formatted. Format should be '*.example.com'`);
    }
  }
}

// Se não houver domínios permitidos, usa o padrão de permitir qualquer origem
// Caso contrário, configura uma função de validação para verificar a origem
const corsConfig = allowedDomains.length === 0 
  ? { 
      origin: "*",
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      exposedHeaders: ['Content-Length', 'Date', 'X-Powered-By']
    } 
  : {
      origin: (origin: string | undefined, cb: (err: Error | null, allow: boolean) => void) => {
        console.log(`CORS check for origin: ${origin || 'undefined'}`);
        
        // Se não houver origem (ex: requisição direta via curl/postman), permite
        // Importante para testes via curl ou ferramentas como Postman
        if (!origin) {
          console.log("No origin provided, allowing request");
          return cb(null, true);
        }

        // Verificar se a origem corresponde a algum dos domínios permitidos
        const isAllowed = allowedDomains.some(domain => {
          if (domain.startsWith('*.')) {
            // Para domínios com wildcard (*.exemplo.com)
            const suffix = domain.substring(1); // Remove o * inicial
            const matches = origin.endsWith(suffix);
            console.log(`  Checking wildcard ${domain} against ${origin}: ${matches ? 'MATCH' : 'NO MATCH'}`);
            return matches;
          } else {
            // Para domínios exatos
            const matches = origin === domain;
            console.log(`  Checking exact ${domain} against ${origin}: ${matches ? 'MATCH' : 'NO MATCH'}`);
            return matches;
          }
        });

        if (isAllowed) {
          console.log(`Origin ${origin} is allowed`);
          return cb(null, true);
        }

        // Se a origem não for permitida, bloqueia
        console.log(`Origin ${origin} is NOT allowed`);
        return cb(new Error("CORS not allowed"), false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
      exposedHeaders: ['Content-Length', 'Date', 'X-Powered-By'],
      maxAge: 86400 // 24 horas em segundos
    };

app.register(fastifyCors, corsConfig);

// Adicionar um hook global para lidar com erros de CORS e fornecer mais informações
app.addHook('onError', (request, reply, error, done) => {
  if (error.message === 'CORS not allowed') {
    console.error(`CORS Error: Origin ${request.headers.origin} is not allowed to access this resource.`);
    reply.code(403).send({
      error: 'Forbidden',
      message: 'CORS policy: Origin not allowed',
      allowedDomains: allowedDomains
    });
    return;
  }
  done();
});

app.register(fastifySwagger, {
    openapi: {
        info: {
            title: "BMC² Tech - Quiz App API",
            description: "API for Quiz App",
            version: "1.0.0",
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
});

app.register(routes);

async function bootstrap() {
    await AppDataSource.initialize()
    
    app.listen({ port: 3333, host: "0.0.0.0" }, () => {
        console.log("HTTP server running on port 3333!");
        console.log("Debug route available at: http://localhost:3333/debug/cors-test");
    });
}

bootstrap()
    .catch((err) => {
        console.error("Error starting application:", err)
        process.exit(1)
    })
