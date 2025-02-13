import z from "zod";
import { FastifyTypedInstance } from "./types";
import { randomUUID } from "node:crypto";
import { AppDataSource } from "./lib/database";
import { User as UserEntity } from "./entities/User";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { redis } from './lib/redis'

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
            description: "List all users",
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


    app.post("/register", {
        schema: {
            tags: ["users"],
            description: "Create a new user",
            body: z.object({
                name: z.string(),
                email: z.string().email(),
                password: z.string().min(6),
            }),
            response: {
                201: z.null().describe("User created successfully"),
            },
        },
        }, async (request, reply) => {
            const { name, email, password } = request.body;

            const hashedPassword = await bcrypt.hash(password, 10)

            const user = userRepository.create({
                id: randomUUID(),
                name,
                email,
                password: hashedPassword,
            })

            await userRepository.save(user)

            return reply.status(201).send()
    })

    app.post("/login", {
        schema: {
            tags: ["auth"],
            description: "Autenticar usuário",
            body: z.object({
                email: z.string().email(),
                password: z.string(),
            }),
            response: {
                200: z.object({
                    access_token: z.string(),
                    refresh_token: z.string(),
                }),
                401: z.object({
                    message: z.string(),
                }),
            },
        },
    }, async (request, reply) => {
        const { email, password } = request.body

        const user = await userRepository.findOne({ where: { email } })

        if (!user || !await bcrypt.compare(password, user.password)) {
            return reply.status(401).send({ message: "Credenciais inválidas" })
        }

        const access_token = jwt.sign(
            { sub: user.id, email: user.email },
            "#bmc@quizapp2025",
            { expiresIn: "15m" }
        )

        const refresh_token = jwt.sign(
            { sub: user.id },
            "#bmc@quizapp2025",
            { expiresIn: "7d" }
        )

        await redis.set(`refresh_token:${user.id}`, refresh_token, {
            EX: 60 * 60 * 24 * 7
        })

        return { access_token, refresh_token }
    })

    app.post("/refresh", {
        schema: {
            tags: ["auth"],
            description: "Renovar token de acesso",
            body: z.object({
                refresh_token: z.string(),
            }),
            response: {
                200: z.object({
                    access_token: z.string(),
                }),
                401: z.object({
                    message: z.string(),
                }),
            },
        },
    }, async (request, reply) => {
        const { refresh_token } = request.body

        try {
            const decoded = jwt.verify(refresh_token, "#bmc@quizapp2025") as { sub: string }
            
            const storedToken = await redis.get(`refresh_token:${decoded.sub}`)
            
            if (!storedToken || storedToken !== refresh_token) {
                return reply.status(401).send({ message: "Token inválido" })
            }

            const access_token = jwt.sign(
                { sub: decoded.sub },
                "#bmc@quizapp2025",
                { expiresIn: "15m" }
            )

            return { access_token }
        } catch {
            return reply.status(401).send({ message: "Token inválido" })
        }
    })
}