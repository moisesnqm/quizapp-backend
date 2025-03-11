import { FastifyTypedInstance } from "../../../../../types"
import { getCampaigns } from "./get-campaigns"
import { getCampaign } from "./get-campaign"
import { createCampaign } from "./create-campaign"
import { updateCampaign } from "./update-campaign"
import { deleteCampaign } from "./delete-campaign"
import { addQuizToCampaign } from "./add-quiz-to-campaign"
import { removeQuizFromCampaign } from "./remove-quiz-from-campaign"
import { ensureAuthenticated } from "@/shared/middlewares/ensureAuthenticated"

export async function campaignRoutes(app: FastifyTypedInstance) {
    await app.register(async (protectedRoutes) => {
        protectedRoutes.addHook('preHandler', ensureAuthenticated)

        await getCampaigns(protectedRoutes)
        await getCampaign(protectedRoutes)
        await createCampaign(protectedRoutes)
        await updateCampaign(protectedRoutes)
        await deleteCampaign(protectedRoutes)
        await addQuizToCampaign(protectedRoutes)
        await removeQuizFromCampaign(protectedRoutes)
    })
} 