import { FastifyTypedInstance } from "../../../../../types"
import { AppDataSource } from "../../../database"
import { QuizResponse } from "../../../database/entities/QuizResponse"
import { z } from "zod"
import { AppError } from "@/shared/errors/AppError"

export async function getQuizResponse(app: FastifyTypedInstance) {
    const repository = AppDataSource.getRepository(QuizResponse)

    app.get("/quiz-responses/:id", {
        schema: {
            tags: ["quiz-responses"],
            summary: "Get quiz response by ID",
            security: [{ bearerAuth: [] }],
            params: z.object({
                id: z.string().uuid(),
            }),
            response: {
                200: z.object({
                    id: z.string(),
                    uuid: z.string(),
                    campaignId: z.string(),
                    quizId: z.string(),
                    content: z.any(),
                    createdAt: z.number(),
                }),
            },
        },
    }, async (request) => {
        const { id } = request.params as { id: string }

        const response = await repository.findOneBy({ id })

        if (!response) {
            throw new AppError('Quiz response not found', 404)
        }

        return {
            id: response.id,
            uuid: response.uuid,
            campaignId: response.campaignId,
            quizId: response.quizId,
            content: response.content,
            createdAt: response.createdAt.getTime(),
        }
    })
} 