import { Repository } from 'typeorm'
import { AppDataSource } from '@/shared/infra/database'
import { Quiz } from '@/shared/infra/database/entities/Quiz'
import { IQuizzesRepository, IFindAllQuizzesDTO } from './IQuizzesRepository'

export class QuizzesRepository implements IQuizzesRepository {
    private repository: Repository<Quiz>

    constructor() {
        this.repository = AppDataSource.getRepository(Quiz)
    }

    async findById(id: string): Promise<Quiz | null> {
        return this.repository.findOneBy({ id })
    }

    async findAll({ page, limit, managerId }: IFindAllQuizzesDTO): Promise<[Quiz[], number]> {
        const where = managerId ? { managerId } : {}
        
        return this.repository.findAndCount({
            where,
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' }
        })
    }

    async findByManagerId(managerId: string): Promise<Quiz[]> {
        return this.repository.findBy({ managerId })
    }

    async create(data: Partial<Quiz>): Promise<Quiz> {
        if (!data.createdAt) {
            data.createdAt = new Date();
        }
        
        const quiz = this.repository.create(data)
        return this.repository.save(quiz)
    }

    async save(quiz: Quiz): Promise<Quiz> {
        return this.repository.save(quiz)
    }

    async delete(quiz: Quiz): Promise<void> {
        await this.repository.remove(quiz)
    }
}
