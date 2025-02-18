import { FastifyTypedInstance } from "../../../../../types";
import { AppDataSource } from "../../../database";
import { Quiz } from "../../../database/entities/Quiz";
import z from "zod";

export async function getQuizzes(app: FastifyTypedInstance) {
    const quizRepository = AppDataSource.getRepository(Quiz);

    app.get("/quizzes", {
        schema: {
            tags: ["quizzes"],
            summary: "List all quizzes",
            description: "List all quizzes with pagination",
            security: [{ bearerAuth: [] }],
            querystring: z.object({
                page: z.string().optional().default("1"),
                limit: z.string().optional().default("10"),
            }),
            response: {
                200: z.object({
                    data: z.array(z.object({
                        id: z.string(),
                        title: z.string(),
                        description: z.string(),
                        managerId: z.string(),
                        createdAt: z.string(),
                    })),
                    meta: z.object({
                        total: z.number(),
                        page: z.number(),
                        lastPage: z.number(),
                    }),
                }),
                401: z.object({
                    message: z.string(),
                }),
            },
        },
    }, async (request) => {
        const { page = "1", limit = "10" } = request.query

        const skip = (Number(page) - 1) * Number(limit)
        const take = Number(limit)

        const [quizzes, total] = await quizRepository.findAndCount({
            order: { createdAt: 'DESC' },
            skip,
            take,
        })

        const lastPage = Math.ceil(total / take)

        return {
            data: quizzes.map(quiz => ({
                id: quiz.id,
                title: quiz.title,
                description: quiz.description,
                managerId: quiz.managerId,
                createdAt: quiz.createdAt.toISOString(),
            })),
            meta: {
                total,
                page: Number(page),
                lastPage,
            }
        }
    })
}