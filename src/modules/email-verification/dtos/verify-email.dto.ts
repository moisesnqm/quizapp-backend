import { z } from 'zod'

export const verifyEmailSchema = z.object({
  email: z.string().email('O email fornecido é inválido')
})

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>

export const verifyEmailResponseSchema = z.object({
  email: z.string().email(),
  status: z.enum([
    'ok', 
    'failed', 
    'unknown', 
    'incorrect', 
    'key_not_valid', 
    'missing parameters'
  ]),
  isValid: z.boolean()
})

export type VerifyEmailResponse = z.infer<typeof verifyEmailResponseSchema> 