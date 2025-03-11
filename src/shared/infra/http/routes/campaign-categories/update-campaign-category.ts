import { FastifyTypedInstance } from "../../../../../types"
import { AppDataSource } from "../../../database"
import { CampaignCategory } from "../../../database/entities/CampaignCategory"
import { z } from "zod"
import { AppError } from "@/shared/errors/AppError"

export async function updateCampaignCategory(app: FastifyTypedInstance) {
    const repository = AppDataSource.getRepository(CampaignCategory)

    app.put("/campaign-categories/:id", {
        schema: {
            tags: ["campaign-categories"],
            summary: "Update a campaign category",
            security: [{ bearerAuth: [] }],
            params: z.object({
                id: z.string().uuid(),
            }),
            body: z.object({
                name: z.string(),
            }),
            response: {
                200: z.object({
                    id: z.string(),
                    name: z.string(),
                }),
            },
        },
    }, async (request) => {
        const { id } = request.params as { id: string }
        const { name } = request.body as { name: string }

        const category = await repository.findOneBy({ id })

        if (!category) {
            throw new AppError('Campaign category not found', 404)
        }

        category.name = name
        await repository.save(category)

        return {
            id: category.id,
            name: category.name,
        }
    })
} 