import { z } from 'zod'

export const createQuizSchema = z.object({
    title: z.string(),
    description: z.string(),
    content: z.any() // qualquer JSON válido
})

export type CreateQuizDTO = z.infer<typeof createQuizSchema>
