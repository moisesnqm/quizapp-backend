import { FastifyTypedInstance } from "../types";
import { AppDataSource } from "../lib/database";
import { User } from "../entities/User";
import z from "zod";
import { Quiz } from "../entities/Quiz";

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
            description: "Update manager information",
            params: z.object({
                id: z.string(),
            }),
            body: z.object({
                name: z.string().optional(),
                email: z.string().email().optional(),
                isActive: z.enum(["Y", "N"]).optional(),
            }),
            response: {
                200: z.object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                    role: z.enum(["admin", "manager"]),
                    isActive: z.enum(["Y", "N"]),
                }),
                404: z.object({
                    message: z.string(),
                }),
                409: z.object({
                    message: z.string(),
                }),
            },
        },
    }, async (request, reply) => {
        const { id } = request.params
        const { name, email, isActive } = request.body

        const manager = await userRepository.findOne({
            where: { id, role: "manager" }
        })

        if (!manager) {
            reply.status(404)
            return { message: "Manager not found" }
        }

        if (email && email !== manager.email) {
            const existingUser = await userRepository.findOne({
                where: { email }
            })

            if (existingUser) {
                reply.status(409)
                return { message: "Email already in use" }
            }
        }

        // Atualiza apenas os campos fornecidos
        if (name) manager.name = name
        if (email) manager.email = email
        if (isActive) manager.isActive = isActive

        await userRepository.save(manager)

        return {
            id: manager.id,
            name: manager.name,
            email: manager.email,
            role: manager.role,
            isActive: manager.isActive,
        }
    })

    app.delete("/managers/:id", {
        schema: {
            tags: ["managers"],
            summary: "Delete manager",
            description: "Delete manager",
            params: z.object({
                id: z.string(),
            }),
            response: {
                200: z.object({
                    message: z.string(),
                }),
                404: z.object({
                    message: z.string(),
                }),
                409: z.object({
                    message: z.string(),
                }),
            },
        },
    }, async (request, reply) => {
        const { id } = request.params

        const manager = await userRepository.findOne({
            where: { id, role: "manager" }
        })

        if (!manager) {
            reply.status(404)
            return { message: "Manager not found" }
        }

        // Verifica se o manager possui quizzes
        const hasQuizzes = await AppDataSource
            .getRepository(Quiz)
            .exists({
                where: { managerId: id }
            })

        if (hasQuizzes) {
            reply.status(409)
            return { message: "Cannot delete manager with associated quizzes" }
        }

        await userRepository.remove(manager)

        return { message: "Manager deleted successfully" }
    })
}
