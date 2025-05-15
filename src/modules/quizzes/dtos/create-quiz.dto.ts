import { z } from 'zod'

export const createQuizSchema = z.object({
    title: z.string(),
    description: z.string(),
    content: z.any(), // qualquer JSON válido
    country: z.string().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
})

export type CreateQuizDTO = z.infer<typeof createQuizSchema>
