import { FastifyTypedInstance } from "../types";
import { AppDataSource } from "../lib/database";
import { User } from "../entities/User";
import { uuidv7 } from 'uuidv7';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { redis } from '../lib/redis';
import z from "zod";
import { randomUUID } from "crypto"
import { env } from "../config/env";

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
            env.JWT_SECRET,
            { expiresIn: "15m" }
        )

        const refresh_token = jwt.sign(
            { sub: user.id },
            env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        )

        await redis.set(`refresh_token:${user.id}`, refresh_token, 'EX', 60 * 60 * 24 * 7)

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
            const decoded = jwt.verify(refresh_token, env.JWT_REFRESH_SECRET) as { sub: string }
            
            const storedToken = await redis.get(`refresh_token:${decoded.sub}`)
            
            if (!storedToken || storedToken !== refresh_token) {
                return reply.status(401).send({ message: "Token inválido" })
            }

            const access_token = jwt.sign(
                { sub: decoded.sub },
                env.JWT_SECRET,
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
            body: z.object({
                userId: z.string(),
            }),
            response: {
                200: z.object({
                    message: z.string(),
                }),
                404: z.object({
                    message: z.string(),
                }),
            },
        },
    }, async (request, reply) => {
        const { userId } = request.body

        const user = await userRepository.findOne({
            where: { id: userId }
        })

        if (!user) {
            reply.status(404)
            return { message: "User not found" }
        }

        const key = `refresh_token:${userId}`
        const hasToken = await redis.exists(key)

        if (!hasToken) {
            reply.status(404)
            return { message: "No active session found" }
        }

        await redis.del(key)

        return { message: "Logged out successfully" }
    })

    app.post("/password/recover", {
        schema: {
            tags: ["auth"],
            summary: "Recover user password",
            description: "Send password recovery instructions to user email",
            body: z.object({
                email: z.string().email(),
            }),
            response: {
                200: z.object({
                    message: z.string(),
                }),
                404: z.object({
                    message: z.string(),
                }),
            },
        },
    }, async (request, reply) => {
        const { email } = request.body

        const user = await userRepository.findOne({
            where: { email }
        })

        if (!user) {
            reply.status(404)
            return { message: "User not found" }
        }

        const token = randomUUID()
        
        // Armazena o token no Redis com expiração de 1 hora
        await redis.set(`password_reset:${token}`, user.id, 'EX', 60 * 60) // 1 hora

        // TODO: Enviar email com o link de recuperação
        // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`
        // await emailService.send({
        //     to: email,
        //     subject: "Password Recovery",
        //     template: "password-recovery",
        //     variables: { resetLink }
        // })

        return { message: "Recovery instructions sent to your email" }
    })

    app.post("/password/reset", {
        schema: {
            tags: ["auth"],
            summary: "Reset user password",
            description: "Reset user password using recovery token",
            body: z.object({
                token: z.string(),
                password: z.string().min(6),
            }),
            response: {
                200: z.object({
                    message: z.string(),
                }),
                400: z.object({
                    message: z.string(),
                }),
                404: z.object({
                    message: z.string(),
                }),
            },
        },
    }, async (request, reply) => {
        const { token, password } = request.body

        const userId = await redis.get(`password_reset:${token}`)

        if (!userId) {
            reply.status(400)
            return { message: "Invalid or expired token" }
        }

        const user = await userRepository.findOne({
            where: { id: userId }
        })

        if (!user) {
            reply.status(404)
            return { message: "User not found" }
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        user.password = hashedPassword

        await userRepository.save(user)
        
        // Remove o token usado
        await redis.del(`password_reset:${token}`)

        // Invalida quaisquer refresh tokens existentes
        await redis.del(`refresh_token:${userId}`)

        return { message: "Password reset successfully" }
    })
}