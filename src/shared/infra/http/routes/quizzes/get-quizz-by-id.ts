import { FastifyTypedInstance } from "../../../../../types";
import { AppDataSource } from "../../../database";
import { Quiz } from "../../../database/entities/Quiz";
import z from "zod";

export async function getQuizzById(app: FastifyTypedInstance) {
    const quizRepository = AppDataSource.getRepository(Quiz);

    app.get("/quizzes/:id", {
        schema: {
            tags: ["quizzes"],
            summary: "Get a quiz by ID",
            description: "Get a quiz by ID with all its content",
            security: [{ bearerAuth: [] }],
            params: z.object({
                id: z.string(),
            }),
            response: {
                200: z.object({
                    id: z.string(),
                    title: z.string(),
                    description: z.string(),
                    managerId: z.string(),
                    content: z.string(),
                    createdAt: z.string(),
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

        return {
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            managerId: quiz.managerId,
            content: quiz.content,
            createdAt: quiz.createdAt.toISOString(),
        }
    })
}