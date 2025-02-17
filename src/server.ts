import "reflect-metadata"
import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";
import { validatorCompiler, serializerCompiler, type ZodTypeProvider, jsonSchemaTransform } from "fastify-type-provider-zod";
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { routes } from "./routes";
import { AppDataSource } from "./lib/database"

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, { origin: "*" });

app.register(fastifySwagger, {
    openapi: {
        info: {
            title: "BMC² Tech - Quiz App API",
            description: "API for Quiz App",
            version: "1.0.0",
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
    
    app.listen({ port: 3333 }, () => {
        console.log("HTTP server running on port 3333!");
    });
}

bootstrap()
    .catch((err) => {
        console.error("Error starting application:", err)
        process.exit(1)
    })
