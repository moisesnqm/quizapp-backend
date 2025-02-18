import { inject, injectable } from 'tsyringe'
import { IQuizzesRepository } from '../repositories/IQuizzesRepository'
import { AppError } from '@/shared/errors/AppError'

@injectable()
export class DeleteQuizService {
    constructor(
        @inject('QuizzesRepository')
        private quizzesRepository: IQuizzesRepository,
    ) {}

    async execute(id: string, managerId: string): Promise<void> {
        const quiz = await this.quizzesRepository.findById(id)

        if (!quiz) {
            throw new AppError('Quiz not found', 404)
        }

        if (quiz.managerId !== managerId) {
            throw new AppError('Not authorized', 403)
        }

        await this.quizzesRepository.delete(quiz)
    }
}
