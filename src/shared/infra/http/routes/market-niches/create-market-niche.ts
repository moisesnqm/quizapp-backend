import { FastifyTypedInstance } from "../../../../../types"
import { AppDataSource } from "../../../database"
import { MarketNiche } from "../../../database/entities/MarketNiche"
import { z } from "zod"

export async function createMarketNiche(app: FastifyTypedInstance) {
    const repository = AppDataSource.getRepository(MarketNiche)

    app.post("/market-niches", {
        schema: {
            tags: ["market-niches"],
            summary: "Create a new market niche",
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

        const niche = repository.create({ name })
        await repository.save(niche)

        return {
            id: niche.id,
            name: niche.name,
        }
    })
} 