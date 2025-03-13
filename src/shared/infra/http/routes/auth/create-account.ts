import { FastifyTypedInstance } from "../../../../../types";
import { AppDataSource } from "../../../database/index";
import { User } from "../../../database/entities/User";
import { uuidv7 } from 'uuidv7';
import bcrypt from "bcrypt";
import z from "zod";


export async function createAccount(app: FastifyTypedInstance) {
    const userRepository = AppDataSource.getRepository(User);

    app.post("/users", {
        schema: {
            tags: ["auth"],
            summary: "Create a new user",
            description: "Create a new user",
            body: z.object({
                name: z.string(),
                email: z.string().email(),
                password: z.string().min(6),
            }),
            response: {
                201: z.null().describe("User created successfully"),
                400: z.object({
                    message: z.string(),
                }).describe("Email already registered"),
                500: z.object({
                    message: z.string(),
                    details: z.string().optional(),
                }).describe("Internal server error"),
            },
        }
    }, async (request, reply) => {
        try {
            const { name, email, password } = request.body;
            const hashedPassword = await bcrypt.hash(password, 10)

            const existingUser = await userRepository.findOne({ 
                where: { email } 
            })

            if (existingUser) {
                return reply.status(400).send({ 
                    message: "Email already registered" 
                })
            }

            const user = userRepository.create({
                id: uuidv7(),
                name,
                email,
                password: hashedPassword,
            })

            await userRepository.save(user)
            return reply.status(201).send()
        } catch (error) {
            return reply.status(500).send({ 
                message: "Internal server error" 
            })
        }
    })
}