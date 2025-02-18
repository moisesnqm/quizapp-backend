import { FastifyReply, FastifyRequest } from 'fastify'
import { container } from 'tsyringe'
import { CreateSessionService } from '../services/CreateSessionService'
import { RefreshTokenService } from '../services/RefreshTokenService'
import { ResetPasswordService } from '../services/ResetPasswordService'
import { createSessionSchema } from '../dtos/create-session.dto'

export class AuthController {
    async createSession(request: FastifyRequest, reply: FastifyReply) {
        console.log('📝 Controller called for authentication')
        
        const { email, password } = createSessionSchema.parse(request.body)

        const createSession = container.resolve(CreateSessionService)

        const { access_token, refresh_token } = await createSession.execute({
            email,
            password,
        })

        return { access_token, refresh_token }
    }

    async refresh(request: FastifyRequest, reply: FastifyReply) {
        const { refresh_token } = request.body as { refresh_token: string }

        const refreshToken = container.resolve(RefreshTokenService)

        const { access_token } = await refreshToken.execute({
            refresh_token,
        })

        return { access_token }
    }

}
