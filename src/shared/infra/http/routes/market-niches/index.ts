import { FastifyTypedInstance } from "../../../../../types"
import { getMarketNiches } from "./get-market-niches"
import { createMarketNiche } from "./create-market-niche"
import { updateMarketNiche } from "./update-market-niche"
import { deleteMarketNiche } from "./delete-market-niche"
import { ensureAuthenticated } from "@/shared/middlewares/ensureAuthenticated"

export async function marketNichesRoutes(app: FastifyTypedInstance) {
    await app.register(async (protectedRoutes) => {
        protectedRoutes.addHook('preHandler', ensureAuthenticated)

        await getMarketNiches(protectedRoutes)
        await createMarketNiche(protectedRoutes)
        await updateMarketNiche(protectedRoutes)
        await deleteMarketNiche(protectedRoutes)
    })
} 