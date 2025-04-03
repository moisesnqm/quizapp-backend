import { FastifyTypedInstance } from "../../../../../types"
import { storeQuizResponse } from './store-quiz-response'
import { getQuizResponses } from './get-quiz-responses'
import { getQuizResponse } from './get-quiz-response'
import { ensureAuthenticated } from "@/shared/middlewares/ensureAuthenticated"

export async function responseRoutes(app: FastifyTypedInstance) {
    await app.register(async (protectedRoutes) => {
        protectedRoutes.addHook('preHandler', ensureAuthenticated)

        await storeQuizResponse(app)
        await getQuizResponses(app)
        await getQuizResponse(app)
    })
}