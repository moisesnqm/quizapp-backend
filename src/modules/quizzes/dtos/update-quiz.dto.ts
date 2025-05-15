import { z } from 'zod'

export const updateQuizSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    content: z.any().optional(),
    country: z.string().optional()
})

export type UpdateQuizDTO = z.infer<typeof updateQuizSchema>
