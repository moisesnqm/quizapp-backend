import { Repository } from 'typeorm'
import { AppDataSource } from '@/shared/infra/database'
import { User } from '../../../shared/infra/database/entities/User'
import { IUsersRepository } from './IUsersRepository'

export class UsersRepository implements IUsersRepository {
    private repository: Repository<User>

    constructor() {
        this.repository = AppDataSource.getRepository(User)
    }

    async findById(id: string): Promise<User | null> {
        return this.repository.findOneBy({ id })
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.repository.findOneBy({ email })
    }

    async create(data: Partial<User>): Promise<User> {
        const user = this.repository.create(data)
        return this.repository.save(user)
    }

    async save(user: User): Promise<User> {
        return this.repository.save(user)
    }
}
