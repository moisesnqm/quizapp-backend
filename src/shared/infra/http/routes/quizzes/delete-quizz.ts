import { FastifyTypedInstance } from "../../../../../types";
import { AppDataSource } from "../../../database";
import { Quiz } from "../../../database/entities/Quiz";
import z from "zod";

export async function deleteQuizz(app: FastifyTypedInstance) {
    const quizRepository = AppDataSource.getRepository(Quiz);

    app.delete("/quizzes/:id", {
        schema: {   
            tags: ["quizzes"],
            summary: "Delete a quiz",
            description: "Delete a quiz",
            security: [{ bearerAuth: [] }],
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
            },
        },
    }, async (request, reply) => {
        const { id } = request.params

        const quiz = await quizRepository.findOne({
            where: { id }
        })

        if (!quiz) {
            reply.status(404)
            return { message: "Quiz not found" }
        }

        await quizRepository.remove(quiz)

        return { message: "Quiz deleted successfully" }
    })
}