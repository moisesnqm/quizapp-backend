import { FastifyTypedInstance } from "../../../../../types"
import { AppDataSource } from "../../../database"
import { Campaign } from "../../../database/entities/Campaign"
import { z } from "zod"
import { AppError } from "@/shared/errors/AppError"

export async function removeQuizFromCampaign(app: FastifyTypedInstance) {
    const repository = AppDataSource.getRepository(Campaign)

    app.delete("/campaigns/:id/quizzes/:quizId", {
        schema: {
            tags: ["campaigns"],
            summary: "Remove quiz from campaign",
            security: [{ bearerAuth: [] }],
            params: z.object({
                id: z.string().uuid(),
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
        const { id, quizId } = request.params as { id: string, quizId: string }

        const campaign = await repository.findOne({
            where: { id },
            relations: ['quizzes'],
        })

        if (!campaign) {
            throw new AppError('Campaign not found', 404)
        }

        campaign.quizzes = campaign.quizzes.filter(quiz => quiz.id !== quizId)
        await repository.save(campaign)

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