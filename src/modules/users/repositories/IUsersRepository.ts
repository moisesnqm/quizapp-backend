import { User } from '../../../shared/infra/database/entities/User'

interface ICreateUserDTO {
    name: string
    email: string
    password: string
    role: 'admin' | 'manager'
}

export interface IUsersRepository {
    findById(id: string): Promise<User | null>
    findByEmail(email: string): Promise<User | null>
    create(data: ICreateUserDTO): Promise<User>
    save(user: User): Promise<User>
}
