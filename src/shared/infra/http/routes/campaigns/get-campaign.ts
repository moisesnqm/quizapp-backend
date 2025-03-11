import { FastifyTypedInstance } from "../../../../../types"
import { AppDataSource } from "../../../database"
import { Campaign } from "../../../database/entities/Campaign"
import { z } from "zod"
import { AppError } from "@/shared/errors/AppError"

export async function getCampaign(app: FastifyTypedInstance) {
    const repository = AppDataSource.getRepository(Campaign)

    app.get("/campaigns/:id", {
        schema: {
            tags: ["campaigns"],
            summary: "Get a campaign by ID",
            security: [{ bearerAuth: [] }],
            params: z.object({
                id: z.string().uuid(),
            }),
            response: {
                200: z.object({
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
                }),
            },
        },
    }, async (request) => {
        const { id } = request.params as { id: string }

        const campaign = await repository.findOne({
            where: { id },
            relations: ['quizzes'],
        })

        if (!campaign) {
            throw new AppError('Campaign not found', 404)
        }

        return {
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
        }
    })
} 