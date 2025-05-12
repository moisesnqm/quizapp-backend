import { FastifyReply, FastifyRequest } from 'fastify'
import { container } from 'tsyringe'
import { VerifyEmailService } from '../services/VerifyEmailService'
import { verifyEmailSchema } from '../dtos/verify-email.dto'

export class EmailVerificationController {
  async verifyEmail(request: FastifyRequest, reply: FastifyReply) {
    const { email } = verifyEmailSchema.parse(request.query)

    const verifyEmailService = container.resolve(VerifyEmailService)
    const result = await verifyEmailService.execute(email)

    return result
  }
} 