import { FastifyTypedInstance } from '../../../../../types'
import { AuthController } from '../../../../../modules/auth/controllers/AuthController'
import { z } from 'zod'

export async function refreshToken(app: FastifyTypedInstance) {
    const authController = new AuthController()

    app.post('/refresh', {
        schema: {
            tags: ['auth'],
            summary: 'Refresh access token',
            description: 'Refresh access token',
            security: [{ bearerAuth: [] }],
            body: z.object({
                refresh_token: z.string(),
            }),
            response: {
                200: z.object({
                    access_token: z.string(),
                }),
                401: z.object({
                    message: z.string(),
                }),
            },
        },
    }, authController.refresh)
}
