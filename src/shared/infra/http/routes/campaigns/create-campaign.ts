import { FastifyTypedInstance } from "../../../../../types"
import { AppDataSource } from "../../../database"
import { Campaign } from "../../../database/entities/Campaign"
import { Quiz } from "../../../database/entities/Quiz"
import { z } from "zod"

export async function createCampaign(app: FastifyTypedInstance) {
    const repository = AppDataSource.getRepository(Campaign)

    app.post("/campaigns", {
        schema: {
            tags: ["campaigns"],
            summary: "Create a new campaign",
            security: [{ bearerAuth: [] }],
            body: z.object({
                name: z.string(),
                subject: z.string().optional(),
                status: z.enum(['Pendente', 'Em Andamento', 'Concluída', 'Cancelada']),
                startDate: z.number(),
                endDate: z.number(),
                owner: z.string(),
                quizIds: z.array(z.string().uuid()).optional(),
            }),
            response: {
                201: z.object({
                    id: z.string(),
                    name: z.string(),
                    subject: z.string().nullable(),
                    status: z.enum(['Pendente', 'Em Andamento', 'Concluída', 'Cancelada']),
                    startDate: z.number(),
                    endDate: z.number(),
                    owner: z.string(),
                    createdAt: z.number(),
                    updatedAt: z.number(),
                }),
            },
        },
    }, async (request, reply) => {
        const { quizIds, ...data } = request.body as {
            name: string
            subject?: string
            status: 'Pendente' | 'Em Andamento' | 'Concluída' | 'Cancelada'
            startDate: number
            endDate: number
            owner: string
            quizIds?: string[]
        }

        const campaign = repository.create({
            ...data,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
        })

        if (quizIds?.length) {
            const quizRepository = AppDataSource.getRepository(Quiz)
            campaign.quizzes = await quizRepository.findByIds(quizIds)
        }

        await repository.save(campaign)

        reply.status(201)
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
        }
    })
} 