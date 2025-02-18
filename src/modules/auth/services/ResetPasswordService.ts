import { inject, injectable } from 'tsyringe'
import { IUsersRepository } from '@/modules/users/repositories/IUsersRepository'
import { ICacheProvider } from '@/shared/container/providers/CacheProvider/models/ICacheProvider'
import { AppError } from '@/shared/errors/AppError'
import { hash } from 'bcrypt'

interface IRequest {
    token: string
    password: string
}

@injectable()
export class ResetPasswordService {
    constructor(
        @inject('UsersRepository')
        private usersRepository: IUsersRepository,

        @inject('CacheProvider')
        private cacheProvider: ICacheProvider,
    ) {}

    async execute({ token, password }: IRequest): Promise<void> {
        const userId = await this.cacheProvider.get(`password_reset:${token}`)

        if (!userId) {
            throw new AppError('Invalid or expired token', 400)
        }

        const user = await this.usersRepository.findById(userId)

        if (!user) {
            throw new AppError('User not found', 404)
        }

        const hashedPassword = await hash(password, 10)
        user.password = hashedPassword

        await this.usersRepository.save(user)
        
        await this.cacheProvider.del(`password_reset:${token}`)
        await this.cacheProvider.del(`refresh_token:${userId}`)
    }
}
