import { FastifyReply, FastifyRequest } from 'fastify'
import { AppError } from '../errors/AppError'

interface CorsOptions {
  allowedDomains?: string[]
}

/**
 * Middleware para restringir acesso a rotas apenas para domínios específicos
 * Suporta wildcards no formato *.dominio.com
 */
export function createCorsMiddleware(options: CorsOptions = {}) {
  const allowedDomains = options.allowedDomains || []

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const origin = request.headers.origin

    // Se não houver origem (ex: requisição direta via curl/postman) ou não houver domínios permitidos, bloqueia
    if (!origin || allowedDomains.length === 0) {
      throw new AppError('Access denied: Origin not allowed', 403)
    }

    // Verificar se a origem corresponde a algum dos domínios permitidos
    const isAllowed = allowedDomains.some(domain => {
      if (domain.startsWith('*.')) {
        // Para domínios com wildcard (*.exemplo.com)
        const suffix = domain.substring(1) // Remove o * inicial
        return origin.endsWith(suffix)
      } else {
        // Para domínios exatos
        return origin === domain
      }
    })

    if (!isAllowed) {
      throw new AppError('Access denied: Origin not allowed', 403)
    }

    // Se chegou aqui, a origem é permitida
    // Configurar os cabeçalhos CORS
    reply.header('Access-Control-Allow-Origin', origin)
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    reply.header('Access-Control-Allow-Credentials', 'true')

    // Se for uma requisição OPTIONS (preflight), responde imediatamente
    if (request.method === 'OPTIONS') {
      reply.send()
      return
    }
  }
} 