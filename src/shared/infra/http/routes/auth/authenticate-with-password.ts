import { FastifyTypedInstance } from "../../../../../types";
import { AuthController } from '../../../../../modules/auth/controllers/AuthController'
import { createSessionSchema } from '../../../../../modules/auth/dtos/create-session.dto'
import { z } from 'zod'

export async function authenticateWithPassword(app: FastifyTypedInstance) {
    const authController = new AuthController()

    app.post('/sessions/password', {
        schema: {
            tags: ['auth'],
            summary: 'Authenticate user with password',
            description: 'Authenticate user with password',
            body: createSessionSchema,
            response: {
                200: z.object({
                    access_token: z.string(),
                    refresh_token: z.string(),
                }),
                401: z.object({
                    message: z.string(),
                }),
            },
        },
    }, authController.createSession)
}