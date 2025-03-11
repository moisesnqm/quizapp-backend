import { FastifyTypedInstance } from "../../../../../types"
import { AppDataSource } from "../../../database"
import { CampaignCategory } from "../../../database/entities/CampaignCategory"
import { z } from "zod"

export async function getCampaignCategories(app: FastifyTypedInstance) {
    const repository = AppDataSource.getRepository(CampaignCategory)

    app.get("/campaign-categories", {
        schema: {
            tags: ["campaign-categories"],
            summary: "List all campaign categories",
            security: [{ bearerAuth: [] }],
            response: {
                200: z.array(z.object({
                    id: z.string(),
                    name: z.string(),
                })),
            },
        },
    }, async () => {
        const categories = await repository.find({
            order: { name: 'ASC' },
        })

        return categories.map(category => ({
            id: category.id,
            name: category.name,
        }))
    })
} 