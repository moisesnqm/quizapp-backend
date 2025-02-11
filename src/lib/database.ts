import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "../entities/User"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "quizapp",
    synchronize: true, // em produção, trocar migrations ao invés de synchronize
    logging: true,
    entities: [User],
    subscribers: [],
    migrations: [],
}) 