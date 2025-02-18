import { FastifyTypedInstance } from "../../../../../types";
import { AppDataSource } from "../../../database/index";
import { User } from "../../../database/entities/User";
import { redis } from '../../../../../shared/infra/cache/redis';
import z from "zod";

export async function logout(app: FastifyTypedInstance) {
    const userRepository = AppDataSource.getRepository(User);

    app.post("/logout", {
        schema: {
            tags: ["auth"],
            summary: "Logout user",
            description: "Invalidate user refresh token",
            security: [{ bearerAuth: [] }],
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
}