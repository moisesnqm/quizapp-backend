import { FastifyTypedInstance } from "../../../types";
import { authRoutes } from "./routes/auth/index";
import { managerRoutes } from "./routes/managers/index";
import { quizzesRoutes } from "./routes/quizzes/index";
import { campaignCategoriesRoutes } from "./routes/campaign-categories";
import { marketNichesRoutes } from "./routes/market-niches";
import { campaignRoutes } from "./routes/campaigns/index";
import { responseRoutes } from "./routes/quiz-responses/index";

export async function routes(app: FastifyTypedInstance) {
    await authRoutes(app);
    await managerRoutes(app);
    await quizzesRoutes(app);
    await campaignCategoriesRoutes(app);
    await marketNichesRoutes(app);
    await campaignRoutes(app);
    await responseRoutes(app);
}