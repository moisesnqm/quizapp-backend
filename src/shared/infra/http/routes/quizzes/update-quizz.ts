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
            description: "Update a quiz with any fields (all fields are optional)",
            security: [{ bearerAuth: [] }],
            params: z.object({
                id: z.string().min(1),
            }),
            body: z.object({
                title: z.string().optional(),
                description: z.string().optional(),
                content: z.any().optional(),
                country: z.string().nullable().optional(),
                theme: z.string().nullable().optional(),
                status: z.string().optional(),
                subject: z.string().nullable().optional(),
            }),
            response: {
                200: z.object({
                    id: z.string(),
                    title: z.string(),
                    description: z.string(),
                    managerId: z.string(),
                    content: z.any(),
                    status: z.string(),
                    subject: z.string().nullable(),
                    country: z.string().nullable(),
                    theme: z.string().nullable(),
                    startDate: z.string().nullable(),
                    endDate: z.string().nullable(),
                    createdAt: z.string(),
                }),
                404: z.object({
                    message: z.string(),
                }),
            },
        },
    }, async (request, reply) => {
        const { id } = request.params
        const updateData = request.body

        const quiz = await quizRepository.findOne({
            where: { id }
        })

        if (!quiz) {
            reply.status(404)
            return { message: "Quiz not found" }
        }

        // Atualizar o quiz com os dados enviados
        Object.assign(quiz, updateData)
        
        await quizRepository.save(quiz)

        return {
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            managerId: quiz.managerId,
            content: quiz.content,
            status: quiz.status,
            subject: quiz.subject,
            country: quiz.country,
            theme: quiz.theme,
            startDate: quiz.startDate ? quiz.startDate.toISOString() : null,
            endDate: quiz.endDate ? quiz.endDate.toISOString() : null,
            createdAt: quiz.createdAt.toISOString(),
        }
    })
}