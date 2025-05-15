import { FastifyTypedInstance } from "../../../../../types";
import { QuizzesController } from '@/modules/quizzes/controllers/QuizzesController'
import { createQuizSchema } from '@/modules/quizzes/dtos/create-quiz.dto'
import z from "zod";

export async function createQuiz(app: FastifyTypedInstance) {
    const quizzesController = new QuizzesController()

    app.post('/quizzes', {
        schema: {
            tags: ['quizzes'],
            summary: 'Create quiz',
            description: 'Create a new quiz',
            security: [{ bearerAuth: [] }],
            body: createQuizSchema,
            response: {
                201: z.object({
                    id: z.string(),
                    title: z.string(),
                    description: z.string(),
                    content: z.any(),
                    country: z.string().optional(),
                    managerId: z.string(),
                    createdAt: z.string(),
                }),
            },
        },
    }, quizzesController.create)
}