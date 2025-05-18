import { FastifyTypedInstance } from "../../../../../types"
import { AppDataSource } from "../../../database"
import { Campaign } from "../../../database/entities/Campaign"
import { Quiz } from "../../../database/entities/Quiz"
import { z } from "zod"
import { AppError } from "@/shared/errors/AppError"

export async function updateCampaign(app: FastifyTypedInstance) {
    const repository = AppDataSource.getRepository(Campaign)

    app.put("/campaigns/:id", {
        schema: {
            tags: ["campaigns"],
            summary: "Update a campaign",
            security: [{ bearerAuth: [] }],
            params: z.object({
                id: z.string().uuid(),
            }),
            body: z.object({
                name: z.string(),
                subject: z.string().optional(),
                status: z.enum(['Pendente', 'Em Andamento', 'Concluída', 'Cancelada']),
                startDate: z.number(),
                endDate: z.number(),
                quizIds: z.array(z.string().uuid()).optional(),
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
                }),
            },
        },
    }, async (request) => {
        const { id } = request.params as { id: string }
        const { quizIds, ...data } = request.body as {
            name: string
            subject?: string
            status: 'Pendente' | 'Em Andamento' | 'Concluída' | 'Cancelada'
            startDate: number
            endDate: number
            quizIds?: string[]
        }

        const campaign = await repository.findOne({
            where: { id },
            relations: ['quizzes'],
        })

        if (!campaign) {
            throw new AppError('Campaign not found', 404)
        }
        
        // Obtém o ID do usuário atual do token JWT
        const userId = request.user.sub
        
        // Verifica se o usuário atual é o proprietário da campanha
        if (campaign.owner !== userId) {
            throw new AppError('You do not have permission to update this campaign', 403)
        }

        Object.assign(campaign, {
            ...data,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            // Mantém o owner original, não permite alteração
        })

        if (quizIds?.length) {
            const quizRepository = AppDataSource.getRepository(Quiz)
            campaign.quizzes = await quizRepository.findByIds(quizIds)
        }

        await repository.save(campaign)

        return {
            id: campaign.id,
            name: campaign.name,
            subject: campaign.subject,
            status: campaign.status,
            startDate: campaign.startDate.getTime(),
            endDate: campaign.endDate.getTime(),
            createdAt: campaign.createdAt.getTime(),
            updatedAt: campaign.updatedAt.getTime(),
        }
    })
} 