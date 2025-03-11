import { FastifyTypedInstance } from "../../../../../types"
import { getCampaignCategories } from "./get-campaign-categories"
import { createCampaignCategory } from "./create-campaign-category"
import { updateCampaignCategory } from "./update-campaign-category"
import { deleteCampaignCategory } from "./delete-campaign-category"
import { ensureAuthenticated } from "@/shared/middlewares/ensureAuthenticated"

export async function campaignCategoriesRoutes(app: FastifyTypedInstance) {
    await app.register(async (protectedRoutes) => {
        protectedRoutes.addHook('preHandler', ensureAuthenticated)

        await getCampaignCategories(protectedRoutes)
        await createCampaignCategory(protectedRoutes)
        await updateCampaignCategory(protectedRoutes)
        await deleteCampaignCategory(protectedRoutes)
    })
} 