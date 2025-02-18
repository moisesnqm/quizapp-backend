import { inject, injectable } from 'tsyringe'
import { IUsersRepository } from '@/modules/users/repositories/IUsersRepository'
import { ICacheProvider } from '@/shared/container/providers/CacheProvider/models/ICacheProvider'
import { IMailProvider } from '@/shared/container/providers/MailProvider/models/IMailProvider'
import { AppError } from '@/shared/errors/AppError'
import { randomUUID } from 'crypto'
import { env } from '@/config/env'

interface IRequest {
    email: string
}

@injectable()
export class RecoverPasswordService {
    constructor(
        @inject('UsersRepository')
        private usersRepository: IUsersRepository,

        @inject('CacheProvider')
        private cacheProvider: ICacheProvider,

        @inject('MailProvider')
        private mailProvider: IMailProvider,
    ) {}

    async execute({ email }: IRequest): Promise<void> {
        const user = await this.usersRepository.findByEmail(email)

        if (!user) {
            throw new AppError('User not found', 404)
        }

        const token = randomUUID()
        
        await this.cacheProvider.set(
            `password_reset:${token}`,
            user.id,
            60 * 60 // 1 hora
        )

        const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`

        await this.mailProvider.sendMail({
            to: email,
            subject: 'Password Recovery',
            template: 'password-recovery',
            variables: { resetLink }
        })
    }
} 