import { z } from 'zod'

export const listQuizzesQuerySchema = z.object({
    page: z.string().default('1'),
    limit: z.string().default('10'),
    managerId: z.string().optional(),
})

export type ListQuizzesQueryDTO = z.infer<typeof listQuizzesQuerySchema> 