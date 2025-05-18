import { FastifyTypedInstance } from "../../../../../types";
import { AppDataSource } from "../../../database";
import { Quiz } from "../../../database/entities/Quiz";
import z from "zod";

export async function updateQuizz(app: FastifyTypedInstance) {
    const quizRepository = AppDataSource.getRepository(Quiz);

    app.put("/quizzes/:id", {
        schema: {
            tags: ["quizzes"],
            summary: "Update a quiz",
            description: "Update a quiz",
            security: [{ bearerAuth: [] }],
            params: z.object({
                id: z.string().min(1),
            }),
            body: z.object({
                title: z.string(),
                description: z.string(),
                content: z.string(),
                country: z.string().optional(),
                theme: z.string().optional()
            }),
            response: {
                200: z.object({
                    id: z.string(),
                    title: z.string(),
                    description: z.string(),
                    managerId: z.string(),
                    content: z.string(),
                    country: z.string().optional(),
                    theme: z.string().optional(),
                    createdAt: z.string(),
                }),
                404: z.object({
                    message: z.string(),
                }),
            },
        },
    }, async (request, reply) => {
        const { id } = request.params
        const { title, description, content, country, theme } = request.body

        const quiz = await quizRepository.findOne({
            where: { id }
        })

        if (!quiz) {
            reply.status(404)
            return { message: "Quiz not found" }
        }

        quiz.title = title
        quiz.description = description
        quiz.content = content
        if (country) {
            quiz.country = country
        }
        if (theme) {
            quiz.theme = theme
        }

        await quizRepository.save(quiz)

        return {
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            managerId: quiz.managerId,
            content: quiz.content,
            country: quiz.country,
            theme: quiz.theme,
            createdAt: quiz.createdAt.toISOString(),
        }
    })
}