import { FastifyTypedInstance } from "../../../../../types"
import { AppDataSource } from "../../../database"
import { CampaignCategory } from "../../../database/entities/CampaignCategory"
import { z } from "zod"
import { AppError } from "@/shared/errors/AppError"

export async function deleteCampaignCategory(app: FastifyTypedInstance) {
    const repository = AppDataSource.getRepository(CampaignCategory)

    app.delete("/campaign-categories/:id", {
        schema: {
            tags: ["campaign-categories"],
            summary: "Delete a campaign category",
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

        const category = await repository.findOneBy({ id })

        if (!category) {
            throw new AppError('Campaign category not found', 404)
        }

        await repository.remove(category)

        return reply.status(204).send()
    })
} 