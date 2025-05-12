import { injectable } from 'tsyringe'
import axios, { AxiosError } from 'axios'
import { AppError } from '@/shared/errors/AppError'
import { VerifyEmailResponse } from '../dtos/verify-email.dto'

@injectable()
export class VerifyEmailService {
  async execute(email: string): Promise<VerifyEmailResponse> {
    try {
      const apiKey = process.env.EMAIL_VERIFY_API_KEY

      if (!apiKey) {
        throw new AppError('API key for email verification not configured', 500)
      }

      const response = await axios.get('https://apps.emaillistverify.com/api/verifyEmail', {
        params: {
          secret: apiKey,
          email
        }
      })

      const status = response.data.toString().trim()

      // Mapear o status para um valor booleano de validade
      const isValid = status === 'ok'

      return {
        email,
        status,
        isValid
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError
        if (axiosError.response) {
          throw new AppError(`Email verification API error: ${axiosError.response.data}`, axiosError.response.status as number)
        } else if (axiosError.request) {
          throw new AppError('Email verification API is not responding', 503)
        }
      }
      
      throw new AppError('Failed to verify email', 500)
    }
  }
} 