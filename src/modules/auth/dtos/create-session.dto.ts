import { z } from 'zod'

export const createSessionSchema = z.object({
    email: z.string().email(),
    password: z.string(),
})

export type CreateSessionDTO = z.infer<typeof createSessionSchema>

export interface ICreateSessionDTO {
    email: string
    password: string
}

export interface ICreateSessionResponseDTO {
    access_token: string
    refresh_token: string
}
