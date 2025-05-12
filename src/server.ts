import "reflect-metadata"
import "@/shared/container"
import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";
import { validatorCompiler, serializerCompiler, type ZodTypeProvider, jsonSchemaTransform } from "fastify-type-provider-zod";
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { routes } from "./shared/infra/http/routes";
import { AppDataSource } from "./shared/infra/database"

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Configuração de CORS com base nos domínios permitidos do .env
const allowedDomainsString = process.env.ALLOWED_DOMAINS || "";
const allowedDomains = allowedDomainsString ? allowedDomainsString.split(',').map(domain => domain.trim()) : [];

// Se não houver domínios permitidos, usa o padrão de permitir qualquer origem
// Caso contrário, configura uma função de validação para verificar a origem
const corsConfig = allowedDomains.length === 0 
  ? { origin: "*" } 
  : {
      origin: (origin: string | undefined, cb: (err: Error | null, allow: boolean) => void) => {
        // Se não houver origem (ex: requisição direta via curl/postman), permite
        if (!origin) {
          return cb(null, true);
        }

        // Verificar se a origem corresponde a algum dos domínios permitidos
        const isAllowed = allowedDomains.some(domain => {
          if (domain.startsWith('*.')) {
            // Para domínios com wildcard (*.exemplo.com)
            const suffix = domain.substring(1); // Remove o * inicial
            return origin.endsWith(suffix);
          } else {
            // Para domínios exatos
            return origin === domain;
          }
        });

        if (isAllowed) {
          return cb(null, true);
        }

        // Se a origem não for permitida, bloqueia
        return cb(new Error("CORS not allowed"), false);
      },
      credentials: true
    };

app.register(fastifyCors, corsConfig);

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
    });
}

bootstrap()
    .catch((err) => {
        console.error("Error starting application:", err)
        process.exit(1)
    })
