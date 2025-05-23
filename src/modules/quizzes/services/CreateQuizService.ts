import { inject, injectable } from 'tsyringe'
import { IQuizzesRepository } from '../repositories/IQuizzesRepository'
import { IUsersRepository } from '@/modules/users/repositories/IUsersRepository'
import { AppError } from '@/shared/errors/AppError'
import { CreateQuizDTO } from '../dtos/create-quiz.dto'
import { Quiz } from '@/shared/infra/database/entities/Quiz'

@injectable()
export class CreateQuizService {
    constructor(
        @inject('QuizzesRepository')
        private quizzesRepository: IQuizzesRepository,

        @inject('UsersRepository')
        private usersRepository: IUsersRepository,
    ) {}

    async execute(managerId: string, data: CreateQuizDTO): Promise<Quiz> {
        const manager = await this.usersRepository.findById(managerId)

        if (!manager) {
            throw new AppError('Manager not found', 404)
        }

        if (manager.role !== 'manager') {
            throw new AppError('Only managers can create quizzes', 403)
        }

        const now = new Date()
        const quiz = await this.quizzesRepository.create({
            id: Quiz.generateId(),
            managerId,
            ...data,
            status: 'draft',
            startDate: data.startDate || now,
            endDate: data.endDate || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
            createdAt: now
        })

        return quiz
    }
}
