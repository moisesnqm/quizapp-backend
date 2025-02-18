import { FastifyReply, FastifyRequest } from 'fastify'
import { verify } from 'jsonwebtoken'
import { env } from '@/config/env'
import { AppError } from '@/shared/errors/AppError'

export async function ensureAuthenticated(
    request: FastifyRequest,
    reply: FastifyReply
) {
    console.log('🔒 Middleware called for route:', request.url)
    
    const authHeader = request.headers.authorization

    if (!authHeader) {
        throw new AppError('Token missing', 401)
    }

    const [, token] = authHeader.split(' ')

    try {
        const { sub } = verify(token, env.JWT_SECRET) as { sub: string }
        request.user = { sub }
    } catch {
        throw new AppError('Invalid token', 401)
    }
}