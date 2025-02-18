import { Quiz } from '@/shared/infra/database/entities/Quiz'

export interface IFindAllQuizzesDTO {
    page: number
    limit: number
    managerId?: string
}

export interface IQuizzesRepository {
    findById(id: string): Promise<Quiz | null>
    findAll(data: IFindAllQuizzesDTO): Promise<[Quiz[], number]>
    findByManagerId(managerId: string): Promise<Quiz[]>
    create(data: Partial<Quiz>): Promise<Quiz>
    save(quiz: Quiz): Promise<Quiz>
    delete(quiz: Quiz): Promise<void>
}
