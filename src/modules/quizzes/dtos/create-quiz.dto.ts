import { z } from 'zod'

export const createQuizSchema = z.object({
    title: z.string(),
    description: z.string(),
    content: z.any(), // qualquer JSON válido
    startDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
    endDate: z.string().optional().transform(str => str ? new Date(str) : undefined)
})

export type CreateQuizDTO = z.infer<typeof createQuizSchema>
