import { FastifyTypedInstance } from "../../../../../types"
import { z } from "zod"
import { EmailVerificationController } from "@/modules/email-verification/controllers/EmailVerificationController"

export async function verifyEmailRoute(app: FastifyTypedInstance) {
    const emailVerificationController = new EmailVerificationController()

    app.get("/email-verification", {
        schema: {
            tags: ["email-verification"],
            summary: "Verify if an email is valid using MailListVerify API",
            querystring: z.object({
                email: z.string().email("O email fornecido é inválido")
            }),
            response: {
                200: z.object({
                    email: z.string(),
                    status: z.string(),
                    isValid: z.boolean()
                }),
            },
        },
    }, emailVerificationController.verifyEmail)
} 