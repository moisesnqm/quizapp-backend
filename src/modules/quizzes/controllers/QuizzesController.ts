import { FastifyReply, FastifyRequest } from 'fastify'
import { container } from 'tsyringe'
import { CreateQuizService } from '../services/CreateQuizService'
import { UpdateQuizService } from '../services/UpdateQuizService'
import { DeleteQuizService } from '../services/DeleteQuizService'
import { ListQuizzesService } from '../services/ListQuizzesService'
import { createQuizSchema } from '../dtos/create-quiz.dto'
import { updateQuizSchema } from '../dtos/update-quiz.dto'
import { listQuizzesQuerySchema } from '../dtos/list-quizzes.dto'

export class QuizzesController {
    async create(request: FastifyRequest, reply: FastifyReply) {
        const data = createQuizSchema.parse(request.body)
        const managerId = request.user.sub

        const createQuiz = container.resolve(CreateQuizService)
        const quiz = await createQuiz.execute(managerId, data)

        return {
            ...quiz,
            createdAt: quiz.createdAt.toISOString()
        }
    }

    async update(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string }
        const data = updateQuizSchema.parse(request.body)
        const managerId = request.user.sub

        const updateQuiz = container.resolve(UpdateQuizService)
        const quiz = await updateQuiz.execute(id, managerId, data)

        return quiz
    }

    async delete(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string }
        const managerId = request.user.sub

        const deleteQuiz = container.resolve(DeleteQuizService)
        await deleteQuiz.execute(id, managerId)

        return { message: 'Quiz deleted successfully' }
    }

    async list(request: FastifyRequest, reply: FastifyReply) {
        const { page, limit, managerId } = listQuizzesQuerySchema.parse(request.query)

        const listQuizzes = container.resolve(ListQuizzesService)
        const { data, meta } = await listQuizzes.execute({
            page: Number(page),
            limit: Number(limit),
            managerId
        })

        return { data, meta }
    }
}
