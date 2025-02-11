import z from "zod";
import { FastifyTypedInstance } from "./types";
import { randomUUID } from "node:crypto";
import { AppDataSource } from "./lib/database";
import { User as UserEntity } from "./entities/User";

interface User {
    id: string;
    name: string;
    email: string;
}

const users: User[] = []

export async function routes(app: FastifyTypedInstance) {
    const userRepository = AppDataSource.getRepository(UserEntity)

    app.get("/users", {
        schema: {
            tags: ["users"],
            description: "Lista todos os usuários",
            response: {
                200: z.array(z.object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                })),
            },
        },
    }, async () => {
        const users = await userRepository.find()
        return users
    })


    app.post("/users", {
        schema: {
            tags: ["users"],
            description: "Cria um novo usuário",
            body: z.object({
                name: z.string(),
                email: z.string().email(),
                password: z.string().min(6),
            }),
            response: {
                201: z.null().describe("Usuário criado com sucesso"),
                },
            },
        }, async (request, reply) => {
            const { name, email, password } = request.body;

            const user = userRepository.create({
                id: randomUUID(),
                name,
                email,
                password,
            })

            await userRepository.save(user)

            return reply.status(201).send()
    })
}