import { FastifyTypedInstance } from "../../../../../types"
import { AppDataSource } from "../../../database"
import { QuizResponse } from "../../../database/entities/QuizResponse"
import { z } from "zod"

export async function storeQuizResponse(app: FastifyTypedInstance) {
    const repository = AppDataSource.getRepository(QuizResponse)

    app.post("/quiz-responses", {
        schema: {
            tags: ["quiz-responses"],
            summary: "Store quiz response",
            security: [{ bearerAuth: [] }],
            body: z.object({
                uuid: z.string().uuid(),
                campaignId: z.string().uuid(),
                quizId: z.string().min(1),
                content: z.any(),
            }),
            response: {
                201: z.object({
                    id: z.string(),
                    uuid: z.string(),
                    campaignId: z.string(),
                    quizId: z.string(),
                    content: z.any(),
                    createdAt: z.number(),
                }),
            },
        },
    }, async (request, reply) => {
        const { uuid, campaignId, quizId, content } = request.body as {
            uuid: string,
            campaignId: string,
            quizId: string,
            content: any
        }

        const quizResponse = new QuizResponse()
        quizResponse.uuid = uuid
        quizResponse.campaignId = campaignId
        quizResponse.quizId = quizId
        quizResponse.content = content

        await repository.save(quizResponse)

        reply.status(201)
        
        return {
            id: quizResponse.id,
            uuid: quizResponse.uuid,
            campaignId: quizResponse.campaignId,
            quizId: quizResponse.quizId,
            content: quizResponse.content,
            createdAt: quizResponse.createdAt.getTime(),
        }
    })
} 