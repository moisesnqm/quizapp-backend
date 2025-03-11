import { FastifyTypedInstance } from "../../../../../types"
import { AppDataSource } from "../../../database"
import { MarketNiche } from "../../../database/entities/MarketNiche"
import { z } from "zod"
import { AppError } from "@/shared/errors/AppError"

export async function updateMarketNiche(app: FastifyTypedInstance) {
    const repository = AppDataSource.getRepository(MarketNiche)

    app.put("/market-niches/:id", {
        schema: {
            tags: ["market-niches"],
            summary: "Update a market niche",
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

        const niche = await repository.findOneBy({ id })

        if (!niche) {
            throw new AppError('Market niche not found', 404)
        }

        niche.name = name
        await repository.save(niche)

        return {
            id: niche.id,
            name: niche.name,
        }
    })
} 