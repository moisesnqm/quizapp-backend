import { FastifyTypedInstance } from "../types";
import { AppDataSource } from "../lib/database";
import { User } from "../entities/User";
import { uuidv7 } from 'uuidv7';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { redis } from '../lib/redis';
import z from "zod";

export async function authRoutes(app: FastifyTypedInstance) {
    const userRepository = AppDataSource.getRepository(User);

app.post("/users", {
    schema: {
        tags: ["auth"],
        summary: "Create a new user",
        description: "Create a new user",
        body: z.object({
            name: z.string(),
            email: z.string().email(),
            password: z.string().min(6),
        }),
        response: {
            201: z.null().describe("User created successfully"),
            400: z.object({
                message: z.string(),
            }).describe("Email already registered"),
            500: z.object({
                message: z.string(),
            }).describe("Internal server error"),
        },
    }
}, async (request, reply) => {
    try {
        const { name, email, password } = request.body;
        const hashedPassword = await bcrypt.hash(password, 10)

        const existingUser = await userRepository.findOne({ 
            where: { email } 
        })

        if (existingUser) {
            return reply.status(400).send({ 
                message: "Email already registered" 
            })
        }

        const user = userRepository.create({
            id: uuidv7(),
            name,
            email,
            password: hashedPassword,
        })

        await userRepository.save(user)
        return reply.status(201).send()
    } catch (error) {
        return reply.status(500).send({ 
            message: "Internal server error" 
        })
    }
})

app.post("/sessions/password", {
    schema: {
        tags: ["auth"],
        summary: "Authenticate user with password",
        description: "Authenticate user with password",
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
        summary: "Refresh access token",
        description: "Refresh access token",
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

app.post("/logout", {
    schema: {
        tags: ["auth"],
        summary: "Logout user",
        description: "Invalidate user refresh token",
    },
}, async () => null)

app.post("/password/recover", {
    schema: {
        tags: ["auth"],
        summary: "Recover user password",
        description: "Recover user password",
    },
}, async () => null)

app.post("/password/reset", {
    schema: {
        tags: ["auth"],
        summary: "Reset user password",
        description: "Reset user password",
    },
}, async () => null)
}