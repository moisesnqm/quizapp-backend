import { FastifyTypedInstance } from "../../../../../types";
import { AppDataSource } from "../../../database/index";
import { User } from "../../../database/entities/User";
import { redis } from '../../../../../shared/infra/cache/redis';
import z from "zod";
import { randomUUID } from "crypto"

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
}