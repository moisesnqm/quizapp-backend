import { FastifyTypedInstance } from "../../../../../types"
import { AppDataSource } from "../../../database"
import { MarketNiche } from "../../../database/entities/MarketNiche"
import { z } from "zod"
import { AppError } from "@/shared/errors/AppError"

export async function deleteMarketNiche(app: FastifyTypedInstance) {
    const repository = AppDataSource.getRepository(MarketNiche)

    app.delete("/market-niches/:id", {
        schema: {
            tags: ["market-niches"],
            summary: "Delete a market niche",
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

        const niche = await repository.findOneBy({ id })

        if (!niche) {
            throw new AppError('Market niche not found', 404)
        }

        await repository.remove(niche)

        return reply.status(204).send()
    })
} 