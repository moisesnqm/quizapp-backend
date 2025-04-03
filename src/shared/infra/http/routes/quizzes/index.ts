import { FastifyTypedInstance } from "../../../../../types";
import { getQuizzes } from "./get-quizzes";
import { getQuizzById } from "./get-quizz-by-id";
import { createQuiz } from "./create-quizz";
import { updateQuizz } from "./update-quizz";
import { deleteQuizz } from "./delete-quizz";
import { getPublicQuiz } from "./get-public-quiz";
import { ensureAuthenticated } from '@/shared/middlewares/ensureAuthenticated'

export async function quizzesRoutes(app: FastifyTypedInstance) {
    // Rotas que precisam de autenticação
    await app.register(async (protectedRoutes) => {
        protectedRoutes.addHook('preHandler', ensureAuthenticated);
        
        await getQuizzes(protectedRoutes);
        await getQuizzById(protectedRoutes);
        await createQuiz(protectedRoutes);
        await updateQuizz(protectedRoutes);
        await deleteQuizz(protectedRoutes);
    });

    // Rotas públicas
    await getPublicQuiz(app);
}