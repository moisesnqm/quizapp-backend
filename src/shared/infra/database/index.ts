import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entities/User"
import { Quiz } from "./entities/Quiz"
import { env } from '../../../config/env'

export const AppDataSource = new DataSource({
    type: "postgres",
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    username: env.DATABASE_USER,
    password: env.DATABASE_PASS,
    database: env.DATABASE_NAME,
    synchronize: true, // em produção, trocar synchronize para migrations
    entities: [User, Quiz],
    subscribers: [],
    migrations: [],
}) 