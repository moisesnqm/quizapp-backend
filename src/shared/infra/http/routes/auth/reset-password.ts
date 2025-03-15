import { FastifyTypedInstance } from "../../../../../types";
import { AppDataSource } from "../../../database/index";
import { User } from "../../../database/entities/User";
import bcrypt from "bcrypt";
import { redis } from '../../../../../shared/infra/cache/redis';
import z from "zod";

export async function resetPassword(app: FastifyTypedInstance) {
    const userRepository = AppDataSource.getRepository(User);

    app.post("/password/reset", {
        schema: {
            tags: ["auth"],
            summary: "Reset user password",
            description: "Reset user password using recovery token",
            body: z.object({
                token: z.string().uuid(),
                password: z.string().min(6).max(100),
                confirmPassword: z.string().min(6).max(100),
            }).refine((data) => data.password === data.confirmPassword, {
                message: "Passwords do not match",
                path: ["confirmPassword"],
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
                500: z.object({
                    message: z.string(),
                    details: z.string().optional(),
                }),
            },
        },
    }, async (request, reply) => {
        try {
            const { token, password } = request.body

            // Verifica se o token existe
            const userId = await redis.get(`password_reset:${token}`)
            if (!userId) {
                reply.status(400)
                return { message: "Invalid or expired token" }
            }

            // Verifica se o token pertence ao usuário
            const storedToken = await redis.get(`password_reset_user:${userId}`)
            if (storedToken !== token) {
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

            // Verifica se a senha nova é diferente da atual
            const isSamePassword = await bcrypt.compare(password, user.password)
            if (isSamePassword) {
                reply.status(400)
                return { message: "New password must be different from current password" }
            }

            const hashedPassword = await bcrypt.hash(password, 10)
            user.password = hashedPassword

            await userRepository.save(user)
            
            // Remove todos os tokens relacionados à recuperação de senha
            await Promise.all([
                redis.del(`password_reset:${token}`),
                redis.del(`password_reset_user:${userId}`),
                redis.del(`refresh_token:${userId}`)
            ])

            return { message: "Password reset successfully" }
        } catch (error) {
            console.error('Error resetting password:', error)
            
            reply.status(500)
            return { 
                message: "Error processing password reset",
                details: error instanceof Error ? error.message : undefined
            }
        }
    })
}