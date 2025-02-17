import { FastifyTypedInstance } from "../types";
import { AppDataSource } from "../lib/database";
import { User } from "../entities/User";
import z from "zod";

export async function quizzesRoutes(app: FastifyTypedInstance) {
    const userRepository = AppDataSource.getRepository(User);

    app.get("/quizzes", {
        schema: {
            tags: ["quizzes"],
            summary: "List all quizzes",
            description: "List all quizzes",
        },
    }, async () => null)

    app.get("/quizzes/:id", {
        schema: {
            tags: ["quizzes"],
            summary: "Get a quiz by ID",
            description: "Get a quiz by ID",
        },
    }, async () => null)

    app.get("/quizzes/manager/:managerId", {
        schema: {
            tags: ["quizzes"],
            summary: "List all quizzes by manager ID",
            description: "List all quizzes by manager ID",
        },
    }, async () => null)

    app.post("/quizzes", {
        schema: {
            tags: ["quizzes"],
            summary: "Create a new quiz",
            description: "Create a new quiz",
        },
    }, async () => null)

    app.put("/quizzes/:id", {
        schema: {
            tags: ["quizzes"],
            summary: "Update a quiz",
            description: "Update a quiz",
        },
    }, async () => null)

    app.delete("/quizzes/:id", {
        schema: {   
            tags: ["quizzes"],
            summary: "Delete a quiz",
            description: "Delete a quiz",
        },
    }, async () => null)
}