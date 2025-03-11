import { FastifyTypedInstance } from "../../../../../types"
import { AppDataSource } from "../../../database"
import { Campaign } from "../../../database/entities/Campaign"
import { z } from "zod"

export async function getCampaigns(app: FastifyTypedInstance) {
    const repository = AppDataSource.getRepository(Campaign)

    app.get("/campaigns", {
        schema: {
            tags: ["campaigns"],
            summary: "List all campaigns",
            security: [{ bearerAuth: [] }],
            querystring: z.object({
                page: z.string().optional().default("1"),
                limit: z.string().optional().default("10"),
            }),
            response: {
                200: z.object({
                    data: z.array(z.object({
                        id: z.string(),
                        name: z.string(),
                        subject: z.string().nullable(),
                        status: z.enum(['Pendente', 'Em Andamento', 'Concluída', 'Cancelada']),
                        startDate: z.number(),
                        endDate: z.number(),
                        owner: z.string(),
                        createdAt: z.number(),
                        updatedAt: z.number(),
                        quizzes: z.array(z.object({
                            id: z.string(),
                            name: z.string(),
                            subject: z.string().nullable(),
                            status: z.string(),
                            startDate: z.number(),
                            endDate: z.number(),
                        })),
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
        const { page = "1", limit = "10" } = request.query as { page?: string, limit?: string }

        const skip = (Number(page) - 1) * Number(limit)
        const take = Number(limit)

        const [campaigns, total] = await repository.findAndCount({
            relations: ['quizzes'],
            order: { createdAt: 'DESC' },
            skip,
            take,
        })

        const lastPage = Math.ceil(total / take)

        return {
            data: campaigns.map(campaign => ({
                id: campaign.id,
                name: campaign.name,
                subject: campaign.subject,
                status: campaign.status,
                startDate: campaign.startDate.getTime(),
                endDate: campaign.endDate.getTime(),
                owner: campaign.owner,
                createdAt: campaign.createdAt.getTime(),
                updatedAt: campaign.updatedAt.getTime(),
                quizzes: campaign.quizzes.map(quiz => ({
                    id: quiz.id,
                    name: quiz.name,
                    subject: quiz.subject,
                    status: quiz.status,
                    startDate: quiz.startDate.getTime(),
                    endDate: quiz.endDate.getTime(),
                })),
            })),
            meta: {
                total,
                page: Number(page),
                lastPage,
            },
        }
    })
} 