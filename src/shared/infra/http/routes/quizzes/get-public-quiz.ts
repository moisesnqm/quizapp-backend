import { FastifyTypedInstance } from "../../../../../types"
import { AppDataSource } from "../../../database"
import { Quiz } from "../../../database/entities/Quiz"
import { Campaign } from "../../../database/entities/Campaign"
import { z } from "zod"
import { AppError } from "@/shared/errors/AppError"

export async function getPublicQuiz(app: FastifyTypedInstance) {
    const quizRepository = AppDataSource.getRepository(Quiz)

    app.get("/public/quizzes/:id", {
        schema: {
            tags: ["quizzes"],
            summary: "Get public quiz information by ID",
            params: z.object({
                id: z.string().min(1),
            }),
            response: {
                200: z.object({
                    id: z.string(),
                    campaignId: z.string(),
                    campaignStatus: z.string(),
                    campaignEndDate: z.number(),
                    content: z.any(),
                }),
            },
        },
    }, async (request) => {
        const { id } = request.params as { id: string }

        // Buscar o quiz com a campanha relacionada usando SQL nativo
        const result = await AppDataSource.query(`
            SELECT q.id as quiz_id, q.content, c.id as campaign_id, c.status, c."endDate"
            FROM quizzes q
            JOIN campaigns_quizzes cq ON q.id = cq.quiz_id
            JOIN campaigns c ON cq.campaign_id = c.id
            WHERE q.id = $1
            LIMIT 1
        `, [id]);

        if (result.length === 0) {
            throw new AppError('Quiz not found or not associated with any campaign', 404)
        }

        const quizData = result[0];

        return {
            id: quizData.quiz_id,
            campaignId: quizData.campaign_id,
            campaignStatus: quizData.status,
            campaignEndDate: new Date(quizData.endDate).getTime(),
            content: quizData.content,
        }
    })
} 