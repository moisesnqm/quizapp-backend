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