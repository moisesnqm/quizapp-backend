import { FastifyTypedInstance } from "../../../../../types";
import { AppDataSource } from "../../../database/index";
import { User } from "../../../database/entities/User";
import z from "zod";
import { Quiz } from "../../../database/entities/Quiz";

export async function deleteManager(app: FastifyTypedInstance) {
    const userRepository = AppDataSource.getRepository(User);

    app.delete("/managers/:id", {
        schema: {
            tags: ["managers"],
            summary: "Delete manager",
            description: "Delete manager",
            params: z.object({
                id: z.string(),
            }),
            response: {
                200: z.object({
                    message: z.string(),
                }),
                404: z.object({
                    message: z.string(),
                }),
                409: z.object({
                    message: z.string(),
                }),
            },
        },
    }, async (request, reply) => {
        const { id } = request.params

        const manager = await userRepository.findOne({
            where: { id, role: "manager" }
        })

        if (!manager) {
            reply.status(404)
            return { message: "Manager not found" }
        }

        // Verifica se o manager possui quizzes
        const hasQuizzes = await AppDataSource
            .getRepository(Quiz)
            .exists({
                where: { managerId: id }
            })

        if (hasQuizzes) {
            reply.status(409)
            return { message: "Cannot delete manager with associated quizzes" }
        }

        await userRepository.remove(manager)

        return { message: "Manager deleted successfully" }
    })
}
