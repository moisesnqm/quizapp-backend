import { FastifyTypedInstance } from "../../../../../types";
import { AppDataSource } from "../../../database/index";
import { User } from "../../../database/entities/User";
import { redis } from '../../../../../shared/infra/cache/redis';
import { MailService } from "../../../../services/mail/MailService";
import z from "zod";
import { randomUUID } from "crypto"

const mailService = new MailService({
    host: process.env.MAIL_HOST!,
    port: Number(process.env.MAIL_PORT),
    auth: {
        user: process.env.MAIL_USER!,
        pass: process.env.MAIL_PASS!
    },
    from: process.env.MAIL_FROM!
})

export async function requestPasswordRecover(app: FastifyTypedInstance) {
    const userRepository = AppDataSource.getRepository(User);

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
                500: z.object({
                    message: z.string(),
                    details: z.string().optional(),
                }),
            },
        },
    }, async (request, reply) => {
        try {
            const { email } = request.body

            const user = await userRepository.findOne({
                where: { email }
            })

            if (!user) {
                reply.status(404)
                return { message: "User not found" }
            }

            // Verifica se já existe um token ativo para este usuário
            const existingToken = await redis.get(`password_reset_user:${user.id}`)
            if (existingToken) {
                // Se existir um token ativo, invalida ele antes de criar um novo
                await redis.del(`password_reset:${existingToken}`)
                await redis.del(`password_reset_user:${user.id}`)
            }

            const token = randomUUID()
            
            // Armazena o token no Redis com expiração de 1 hora
            await Promise.all([
                redis.set(`password_reset:${token}`, user.id, 'EX', 60 * 60), // 1 hora
                redis.set(`password_reset_user:${user.id}`, token, 'EX', 60 * 60) // 1 hora
            ])

            const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`
            
            await mailService.send({
                to: email,
                subject: "Password Recovery",
                template: "password-recovery",
                variables: { resetLink }
            })

            return { 
                message: "Recovery instructions sent to your email" 
            }
        } catch (error) {
            console.error('Error processing password recovery:', error)
            
            reply.status(500)
            return { 
                message: "Error processing password recovery",
                details: error instanceof Error ? error.message : undefined
            }
        }
    })
}