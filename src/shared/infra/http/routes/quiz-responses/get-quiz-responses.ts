import { FastifyTypedInstance } from "../../../../../types"
import { AppDataSource } from "../../../database"
import { QuizResponse } from "../../../database/entities/QuizResponse"
import { z } from "zod"

export async function getQuizResponses(app: FastifyTypedInstance) {
    const repository = AppDataSource.getRepository(QuizResponse)

    app.get("/quiz-responses", {
        schema: {
            tags: ["quiz-responses"],
            summary: "List quiz responses",
            security: [{ bearerAuth: [] }],
            querystring: z.object({
                page: z.string().optional().default("1"),
                limit: z.string().optional().default("10"),
                campaignId: z.string().uuid().optional(),
                quizId: z.string().uuid().optional(),
            }),
            response: {
                200: z.object({
                    data: z.array(z.object({
                        id: z.string(),
                        uuid: z.string(),
                        campaignId: z.string(),
                        quizId: z.string(),
                        content: z.any(),
                        createdAt: z.number(),
                    })),
                    meta: z.object({
                        total: z.number(),
                        page: z.number(),
                        lastPage: z.number(),
                    }),
                }),
            },
        },
    }, async (request) => {
        const { 
            page = "1", 
            limit = "10",
            campaignId,
            quizId
        } = request.query as { 
            page?: string, 
            limit?: string,
            campaignId?: string,
            quizId?: string
        }

        const skip = (Number(page) - 1) * Number(limit)
        const take = Number(limit)

        // Construir where de acordo com os filtros fornecidos
        const whereOptions: any = {}
        
        if (campaignId) {
            whereOptions.campaignId = campaignId
        }
        
        if (quizId) {
            whereOptions.quizId = quizId
        }

        const [responses, total] = await repository.findAndCount({
            where: Object.keys(whereOptions).length > 0 ? whereOptions : undefined,
            order: { createdAt: 'DESC' },
            skip,
            take,
        })

        const lastPage = Math.ceil(total / take)

        return {
            data: responses.map(response => ({
                id: response.id,
                uuid: response.uuid,
                campaignId: response.campaignId,
                quizId: response.quizId,
                content: response.content,
                createdAt: response.createdAt.getTime(),
            })),
            meta: {
                total,
                page: Number(page),
                lastPage,
            },
        }
    })
} 