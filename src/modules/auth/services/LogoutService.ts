import { inject, injectable } from 'tsyringe'
import { ICacheProvider } from '@/shared/container/providers/CacheProvider/models/ICacheProvider'
import { IUsersRepository } from '@/modules/users/repositories/IUsersRepository'
import { AppError } from '@/shared/errors/AppError'

interface IRequest {
    userId: string
}

@injectable()
export class LogoutService {
    constructor(
        @inject('CacheProvider')
        private cacheProvider: ICacheProvider,

        @inject('UsersRepository')
        private usersRepository: IUsersRepository,
    ) {}

    async execute({ userId }: IRequest): Promise<void> {
        const user = await this.usersRepository.findById(userId)

        if (!user) {
            throw new AppError('User not found', 404)
        }

        const key = `refresh_token:${userId}`
        const hasToken = await this.cacheProvider.get(key)

        if (!hasToken) {
            throw new AppError('No active session found', 404)
        }

        await this.cacheProvider.del(key)
    }
}
