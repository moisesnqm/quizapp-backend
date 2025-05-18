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
                    createdAt: z.number(),
                    updatedAt: z.number(),
                    quizzes: z.array(z.object({
                        id: z.string(),
                        name: z.string(),
                        subject: z.string().nullable(),
                        status: z.string(),
                        startDate: z.number().nullable(),
                        endDate: z.number().nullable(),
                    })),
                }),
            },
        },
    }, async (request) => {
        const { id } = request.params as { id: string }
        const userId = request.user.sub

        const campaign = await repository.findOne({
            where: { id },
            relations: ['quizzes'],
        })

        if (!campaign) {
            throw new AppError('Campaign not found', 404)
        }
        
        // Verifica se o usuário atual é o proprietário da campanha
        const isOwner = campaign.owner === userId
        
        // Se não for o proprietário, retorna erro 403
        if (!isOwner) {
            throw new AppError('You do not have permission to view this campaign', 403)
        }

        return {
            id: campaign.id,
            name: campaign.name,
            subject: campaign.subject,
            status: campaign.status,
            startDate: campaign.startDate.getTime(),
            endDate: campaign.endDate.getTime(),
            createdAt: campaign.createdAt.getTime(),
            updatedAt: campaign.updatedAt.getTime(),
            quizzes: campaign.quizzes.map(quiz => ({
                id: quiz.id,
                name: quiz.title,
                subject: quiz.subject || null,
                status: quiz.status,
                startDate: quiz.startDate ? quiz.startDate.getTime() : null,
                endDate: quiz.endDate ? quiz.endDate.getTime() : null,
            })),
        }
    })
} 