import { inject, injectable } from 'tsyringe'
import { IUsersRepository } from '@/modules/users/repositories/IUsersRepository'
import { ICacheProvider } from '@/shared/container/providers/CacheProvider/models/ICacheProvider'
import { AppError } from '@/shared/errors/AppError'
import { sign } from 'jsonwebtoken'
import { env } from '@/config/env'

interface IRequest {
    email: string
    password: string
}

interface IResponse {
    access_token: string
    refresh_token: string
}

interface IHashProvider {
    compareHash(payload: string, hashed: string): Promise<boolean>
    generateHash(payload: string): Promise<string>
}

@injectable()
export class CreateSessionService {
    constructor(
        @inject('UsersRepository')
        private usersRepository: IUsersRepository,

        @inject('HashProvider')
        private hashProvider: IHashProvider,

        @inject('CacheProvider')
        private cacheProvider: ICacheProvider,
    ) {}

    async execute({ email, password }: IRequest): Promise<IResponse> {
        const user = await this.usersRepository.findByEmail(email)

        if (!user) {
            throw new AppError('Invalid credentials', 401)
        }

        const passwordMatch = await this.hashProvider.compareHash(password, user.password)

        if (!passwordMatch) {
            throw new AppError('Invalid credentials', 401)
        }

        const access_token = sign(
            { sub: user.id, email: user.email },
            env.JWT_SECRET,
            { expiresIn: '1d' }
        )

        const refresh_token = sign(
            { sub: user.id },
            env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        )

        await this.cacheProvider.set(
            `refresh_token:${user.id}`,
            refresh_token,
            60 * 60 * 24 * 7 // 7 days
        )

        return {
            access_token,
            refresh_token,
        }
    }
}
