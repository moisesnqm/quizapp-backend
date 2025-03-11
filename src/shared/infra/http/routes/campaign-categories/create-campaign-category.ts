import { FastifyTypedInstance } from "../../../../../types"
import { AppDataSource } from "../../../database"
import { CampaignCategory } from "../../../database/entities/CampaignCategory"
import { z } from "zod"

export async function createCampaignCategory(app: FastifyTypedInstance) {
    const repository = AppDataSource.getRepository(CampaignCategory)

    app.post("/campaign-categories", {
        schema: {
            tags: ["campaign-categories"],
            summary: "Create a new campaign category",
            security: [{ bearerAuth: [] }],
            body: z.object({
                name: z.string(),
            }),
            response: {
                201: z.object({
                    id: z.string(),
                    name: z.string(),
                }),
            },
        },
    }, async (request) => {
        const { name } = request.body as { name: string }

        const category = repository.create({ name })
        await repository.save(category)

        return {
            id: category.id,
            name: category.name,
        }
    })
} 