import { FastifyTypedInstance } from "../../../../../types"
import { corsTestRoute } from "./cors-test"

export async function debugRoutes(app: FastifyTypedInstance) {
    // Rotas de debug - não usar em produção
    await corsTestRoute(app)
} 