import { FastifyTypedInstance } from "../../../../../types"
import { AppDataSource } from "../../../database"
import { Campaign } from "../../../database/entities/Campaign"
import { z } from "zod"
import { AppError } from "@/shared/errors/AppError"

export async function deleteCampaign(app: FastifyTypedInstance) {
    const repository = AppDataSource.getRepository(Campaign)

    app.delete("/campaigns/:id", {
        schema: {
            tags: ["campaigns"],
            summary: "Delete a campaign",
            security: [{ bearerAuth: [] }],
            params: z.object({
                id: z.string().uuid(),
            }),
            response: {
                204: z.null(),
            },
        },
    }, async (request, reply) => {
        const { id } = request.params as { id: string }
        const userId = request.user.sub

        const campaign = await repository.findOneBy({ id })

        if (!campaign) {
            throw new AppError('Campaign not found', 404)
        }
        
        // Verifica se o usuário atual é o proprietário da campanha
        if (campaign.owner !== userId) {
            throw new AppError('You do not have permission to delete this campaign', 403)
        }

        await repository.remove(campaign)

        return reply.status(204).send()
    })
} 