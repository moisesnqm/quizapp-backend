import { FastifyReply, FastifyRequest } from 'fastify'

/**
 * Middleware para logar informações sobre as requisições
 * Útil para debug de problemas com CORS
 */
export async function requestLogger(request: FastifyRequest, reply: FastifyReply) {
  const timestamp = new Date().toISOString()
  const { method, url, headers } = request
  
  console.log(`[${timestamp}] Request: ${method} ${url}`)
  console.log('  Headers:')
  console.log(`    Origin: ${headers.origin || 'none'}`)
  console.log(`    Referer: ${headers.referer || 'none'}`)
  console.log(`    User-Agent: ${headers['user-agent'] || 'none'}`)
  console.log(`    Host: ${headers.host || 'none'}`)
  
  // Registramos o status de resposta após o processamento
  const startTime = Date.now()
  
  // Hook de finalização da requisição para logar a resposta
  request.raw.on('close', () => {
    const duration = Date.now() - startTime
    console.log(`[${timestamp}] Response: ${reply.statusCode} for ${method} ${url} (${duration}ms)`)
  })
} 