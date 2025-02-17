import { z } from 'zod'

const envSchema = z.object({
    // Database
    DATABASE_HOST: z.string(),
    DATABASE_PORT: z.string().transform(Number),
    DATABASE_USER: z.string(),
    DATABASE_PASS: z.string(),
    DATABASE_NAME: z.string(),

    // JWT
    JWT_SECRET: z.string().min(32, "JWT secret must be at least 32 characters"),
    JWT_REFRESH_SECRET: z.string().min(32, "JWT refresh secret must be at least 32 characters"),

    // Redis
    REDIS_HOST: z.string(),
    REDIS_PORT: z.string().transform(Number),
    REDIS_PASS: z.string().optional(),

    // Frontend
    FRONTEND_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)