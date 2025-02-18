import { FastifyTypedInstance } from "../../../types";
import { authRoutes } from "./routes/auth/index";
import { managerRoutes } from "./routes/managers/index";
import { quizzesRoutes } from "./routes/quizzes/index";
export async function routes(app: FastifyTypedInstance) {
    await authRoutes(app);
    await managerRoutes(app);
    await quizzesRoutes(app);
}