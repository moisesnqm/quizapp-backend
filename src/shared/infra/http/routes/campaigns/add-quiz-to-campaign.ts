import { FastifyTypedInstance } from "../../../../../types"
import { AppDataSource } from "../../../database"
import { Campaign } from "../../../database/entities/Campaign"
import { Quiz } from "../../../database/entities/Quiz"
import { z } from "zod"
import { AppError } from "@/shared/errors/AppError"

export async function addQuizToCampaign(app: FastifyTypedInstance) {
    const campaignRepository = AppDataSource.getRepository(Campaign)
    const quizRepository = AppDataSource.getRepository(Quiz)

    app.post("/campaigns/:id/quizzes", {
        schema: {
            tags: ["campaigns"],
            summary: "Add quiz to campaign",
            security: [{ bearerAuth: [] }],
            params: z.object({
                id: z.string().uuid(),
            }),
            body: z.object({
                quizId: z.string().uuid(),
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
                        title: z.string(),
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
        const { quizId } = request.body as { quizId: string }

        const campaign = await campaignRepository.findOne({
            where: { id },
            relations: ['quizzes'],
        })

        if (!campaign) {
            throw new AppError('Campaign not found', 404)
        }

        const quiz = await quizRepository.findOneBy({ id: quizId })

        if (!quiz) {
            throw new AppError('Quiz not found', 404)
        }

        campaign.quizzes.push(quiz)
        await campaignRepository.save(campaign)

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
                title: quiz.title,
                subject: quiz.subject || null,
                status: quiz.status,
                startDate: quiz.startDate ? quiz.startDate.getTime() : null,
                endDate: quiz.endDate ? quiz.endDate.getTime() : null,
            })),
        }
    })
} 