import { FastifyTypedInstance } from "../../../../../types"
import { verifyEmailRoute } from "./verify-email"

export async function emailVerificationRoutes(app: FastifyTypedInstance) {
    // Rotas públicas
    await verifyEmailRoute(app)
} 