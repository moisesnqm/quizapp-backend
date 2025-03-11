import { FastifyTypedInstance } from "../../../../../types"
import { AppDataSource } from "../../../database"
import { MarketNiche } from "../../../database/entities/MarketNiche"
import { z } from "zod"

export async function getMarketNiches(app: FastifyTypedInstance) {
    const repository = AppDataSource.getRepository(MarketNiche)

    app.get("/market-niches", {
        schema: {
            tags: ["market-niches"],
            summary: "List all market niches",
            security: [{ bearerAuth: [] }],
            response: {
                200: z.array(z.object({
                    id: z.string(),
                    name: z.string(),
                })),
            },
        },
    }, async () => {
        const niches = await repository.find({
            order: { name: 'ASC' },
        })

        return niches.map(niche => ({
            id: niche.id,
            name: niche.name,
        }))
    })
} 