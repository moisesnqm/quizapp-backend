import { inject, injectable } from 'tsyringe'
import { IQuizzesRepository } from '../repositories/IQuizzesRepository'
import { AppError } from '@/shared/errors/AppError'
import { UpdateQuizDTO } from '../dtos/update-quiz.dto'
import { Quiz } from '@/shared/infra/database/entities/Quiz'

@injectable()
export class UpdateQuizService {
    constructor(
        @inject('QuizzesRepository')
        private quizzesRepository: IQuizzesRepository,
    ) {}

    async execute(id: string, managerId: string, data: UpdateQuizDTO): Promise<Quiz> {
        const quiz = await this.quizzesRepository.findById(id)

        if (!quiz) {
            throw new AppError('Quiz not found', 404)
        }

        if (quiz.managerId !== managerId) {
            throw new AppError('Not authorized', 403)
        }

        Object.assign(quiz, data)

        const updatedQuiz = await this.quizzesRepository.save(quiz)

        return updatedQuiz
    }
}
