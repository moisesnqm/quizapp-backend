import { inject, injectable } from 'tsyringe'
import { IQuizzesRepository } from '../repositories/IQuizzesRepository'
import { Quiz } from '@/shared/infra/database/entities/Quiz'

interface IRequest {
    page: number
    limit: number
    managerId?: string
}

interface IResponse {
    data: Quiz[]
    meta: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

@injectable()
export class ListQuizzesService {
    constructor(
        @inject('QuizzesRepository')
        private quizzesRepository: IQuizzesRepository,
    ) {}

    async execute({ page, limit, managerId }: IRequest): Promise<IResponse> {
        const [quizzes, total] = await this.quizzesRepository.findAll({
            page,
            limit,
            managerId,
        })

        return {
            data: quizzes,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        }
    }
}
