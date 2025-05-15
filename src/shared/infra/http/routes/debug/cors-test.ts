import { FastifyTypedInstance } from "../../../../../types"

export async function corsTestRoute(app: FastifyTypedInstance) {
    app.get("/debug/cors-test", {
        schema: {
            tags: ["debug"],
            summary: "Test route for CORS debugging",
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        requestInfo: {
                            type: 'object',
                            properties: {
                                headers: { type: 'object' },
                                method: { type: 'string' },
                                url: { type: 'string' },
                                ip: { type: 'string' }
                            }
                        },
                        corsConfig: {
                            type: 'object',
                            properties: {
                                allowedDomains: { type: 'array', items: { type: 'string' } }
                            }
                        }
                    }
                }
            }
        },
    }, async (request, reply) => {
        const allowedDomainsString = process.env.ALLOWED_DOMAINS || "";
        const allowedDomains = allowedDomainsString 
            ? allowedDomainsString.split(',').map(domain => domain.trim()) 
            : [];

        // Extrair informações da requisição
        const { headers, method, url, ip } = request;
        
        return {
            success: true,
            message: "CORS test successful. If you're seeing this, the request passed CORS validation.",
            requestInfo: {
                headers,
                method,
                url,
                ip: request.ip
            },
            corsConfig: {
                allowedDomains
            }
        };
    });
} 