import { FastifyTypedInstance } from "../../../../../types";
import { AppDataSource } from "../../../database/index";
import { User } from "../../../database/entities/User";
import z from "zod";

export async function listManagers(app: FastifyTypedInstance) {
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
}
