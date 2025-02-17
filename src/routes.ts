import { FastifyTypedInstance } from "./types";
import { authRoutes } from "./routes/auth";
import { managerRoutes } from "./routes/managers";
import { quizzesRoutes } from "./routes/quizzes";
export async function routes(app: FastifyTypedInstance) {
    await authRoutes(app);
    await managerRoutes(app);
    await quizzesRoutes(app);
}