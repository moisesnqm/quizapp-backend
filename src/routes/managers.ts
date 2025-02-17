import { FastifyTypedInstance } from "../types";
import { AppDataSource } from "../lib/database";
import { User } from "../entities/User";
import z from "zod";

export async function managerRoutes(app: FastifyTypedInstance) {
    const userRepository = AppDataSource.getRepository(User);

    app.get("/managers", {
        schema: {
            tags: ["managers"],
            summary: "List all users with role 'manager'",
            description: "List all users with role 'manager'",
            response: {
                200: z.array(z.object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                })),
            },
        },
    }, async () => {
        const users = await userRepository.find({
            where: {
                role: 'manager'
            }
        });
        return users;
    });

    app.put("/managers/:id", {
        schema: {
            tags: ["managers"],
            summary: "Update manager",
            description: "Update manager",
        },
    }, async () => null)

    app.delete("/managers/:id", {
        schema: {
            tags: ["managers"],
            summary: "Delete manager",
            description: "Delete manager",
        },
    }, async () => null)
}
