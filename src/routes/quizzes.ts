import { FastifyTypedInstance } from "../types";
import { AppDataSource } from "../lib/database";
import { Quiz } from "../entities/Quiz";
import { createId } from '@paralleldrive/cuid2';
import z from "zod";

export async function quizzesRoutes(app: FastifyTypedInstance) {
    const quizRepository = AppDataSource.getRepository(Quiz);

    app.get("/quizzes", {
        schema: {
            tags: ["quizzes"],
            summary: "List all quizzes",
            description: "List all quizzes with pagination",
            querystring: z.object({
                page: z.string().optional().default("1"),
                limit: z.string().optional().default("10"),
            }),
            response: {
                200: z.object({
                    data: z.array(z.object({
                        id: z.string(),
                        title: z.string(),
                        description: z.string(),
                        managerId: z.string(),
                        createdAt: z.string(),
                    })),
                    meta: z.object({
                        total: z.number(),
                        page: z.number(),
                        lastPage: z.number(),
                    }),
                }),
            },
        },
    }, async (request) => {
        const { page = "1", limit = "10" } = request.query

        const skip = (Number(page) - 1) * Number(limit)
        const take = Number(limit)

        const [quizzes, total] = await quizRepository.findAndCount({
            order: { createdAt: 'DESC' },
            skip,
            take,
        })

        const lastPage = Math.ceil(total / take)

        return {
            data: quizzes.map(quiz => ({
                id: quiz.id,
                title: quiz.title,
                description: quiz.description,
                managerId: quiz.managerId,
                createdAt: quiz.createdAt.toISOString(),
            })),
            meta: {
                total,
                page: Number(page),
                lastPage,
            }
        }
    })

    app.get("/quizzes/:id", {
        schema: {
            tags: ["quizzes"],
            summary: "Get a quiz by ID",
            description: "Get a quiz by ID with all its information",
            params: z.object({
                id: z.string(),
            }),
            response: {
                200: z.object({
                    id: z.string(),
                    title: z.string(),
                    description: z.string(),
                    managerId: z.string(),
                    info: z.array(z.object({
                        text: z.string(),
                        options: z.array(z.object({
                            text: z.string(),
                            isCorrect: z.boolean(),
                        })),
                    })),
                    createdAt: z.string(),
                }),
                404: z.object({
                    message: z.string(),
                }),
            },
        },
    }, async (request, reply) => {
        const { id } = request.params

        const quiz = await quizRepository.findOne({
            where: { id }
        })

        if (!quiz) {
            reply.status(404)
            return { message: "Quiz not found" }
        }

        return {
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            managerId: quiz.managerId,
            info: quiz.info,
            createdAt: quiz.createdAt.toISOString(),
        }
    })

    app.get("/quizzes/manager/:managerId", {
        schema: {
            tags: ["quizzes"],
            summary: "List all quizzes by manager ID",
            description: "List all quizzes by manager ID with pagination",
            params: z.object({
                managerId: z.string(),
            }),
            querystring: z.object({
                page: z.string().optional().default("1"),
                limit: z.string().optional().default("10"),
            }),
            response: {
                200: z.object({
                    data: z.array(z.object({
                        id: z.string(),
                        title: z.string(),
                        description: z.string(),
                        managerId: z.string(),
                        createdAt: z.string(),
                    })),
                    meta: z.object({
                        total: z.number(),
                        page: z.number(),
                        lastPage: z.number(),
                    }),
                }),
                404: z.object({
                    message: z.string(),
                }),
            },
        },
    }, async (request, reply) => {
        const { managerId } = request.params
        const { page = "1", limit = "10" } = request.query

        const skip = (Number(page) - 1) * Number(limit)
        const take = Number(limit)

        const [quizzes, total] = await quizRepository.findAndCount({
            where: { managerId },
            order: { createdAt: 'DESC' },
            skip,
            take,
        })

        if (!quizzes.length) {
            reply.status(404)
            return { message: "No quizzes found for this manager" }
        }

        const lastPage = Math.ceil(total / take)

        return {
            data: quizzes.map(quiz => ({
                id: quiz.id,
                title: quiz.title,
                description: quiz.description,
                managerId: quiz.managerId,
                createdAt: quiz.createdAt.toISOString(),
            })),
            meta: {
                total,
                page: Number(page),
                lastPage,
            }
        }
    })

    app.post("/quizzes", {
        schema: {
            tags: ["quizzes"],
            summary: "Create a new quiz",
            description: "Create a new quiz",
            body: z.object({
                title: z.string(),
                description: z.string(),
                managerId: z.string(),
                info: z.array(z.object({
                    text: z.string(),
                    options: z.array(z.object({
                        text: z.string(),
                        isCorrect: z.boolean(),
                    })),
                })),
            }),
            response: {
                201: z.object({
                    id: z.string(),
                    title: z.string(),
                    description: z.string(),
                    managerId: z.string(),
                    createdAt: z.string(),
                }),
            },
        },
    }, async (request, reply) => {
        const { title, description, managerId, info } = request.body
        
        const quiz = quizRepository.create({
            id: createId(),
            title,
            description,
            managerId,
            info,
        })

        await quizRepository.save(quiz)

        reply.status(201)
        return {
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            managerId: quiz.managerId,
            createdAt: quiz.createdAt.toISOString(),
        }
    })

    app.put("/quizzes/:id", {
        schema: {
            tags: ["quizzes"],
            summary: "Update a quiz",
            description: "Update a quiz",
            params: z.object({
                id: z.string(),
            }),
            body: z.object({
                title: z.string(),
                description: z.string(),
                info: z.array(z.object({
                    text: z.string(),
                    options: z.array(z.object({
                        text: z.string(),
                        isCorrect: z.boolean(),
                    })),
                })),
            }),
            response: {
                200: z.object({
                    id: z.string(),
                    title: z.string(),
                    description: z.string(),
                    managerId: z.string(),
                    createdAt: z.string(),
                }),
                404: z.object({
                    message: z.string(),
                }),
            },
        },
    }, async (request, reply) => {
        const { id } = request.params
        const { title, description, info } = request.body

        const quiz = await quizRepository.findOne({
            where: { id }
        })

        if (!quiz) {
            reply.status(404)
            return { message: "Quiz not found" }
        }

        quiz.title = title
        quiz.description = description
        quiz.info = info

        await quizRepository.save(quiz)

        return {
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            managerId: quiz.managerId,
            createdAt: quiz.createdAt.toISOString(),
        }
    })

    app.delete("/quizzes/:id", {
        schema: {   
            tags: ["quizzes"],
            summary: "Delete a quiz",
            description: "Delete a quiz",
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
            },
        },
    }, async (request, reply) => {
        const { id } = request.params

        const quiz = await quizRepository.findOne({
            where: { id }
        })

        if (!quiz) {
            reply.status(404)
            return { message: "Quiz not found" }
        }

        await quizRepository.remove(quiz)

        return { message: "Quiz deleted successfully" }
    })
}