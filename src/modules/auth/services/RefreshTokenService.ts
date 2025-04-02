import { inject, injectable } from 'tsyringe'
import { ICacheProvider } from '@/shared/container/providers/CacheProvider/models/ICacheProvider'
import { AppError } from '@/shared/errors/AppError'
import { verify, sign } from 'jsonwebtoken'
import { env } from '@/config/env'

interface IRequest {
    refresh_token: string
}

interface IResponse {
    access_token: string
}

@injectable()
export class RefreshTokenService {
    constructor(
        @inject('CacheProvider')
        private cacheProvider: ICacheProvider,
    ) {}

    async execute({ refresh_token }: IRequest): Promise<IResponse> {
        try {
            const decoded = verify(refresh_token, env.JWT_REFRESH_SECRET) as { sub: string }
            
            const storedToken = await this.cacheProvider.get(`refresh_token:${decoded.sub}`)
            
            if (!storedToken || storedToken !== refresh_token) {
                throw new AppError('Invalid token', 401)
            }

            const access_token = sign(
                { sub: decoded.sub },
                env.JWT_SECRET,
                { expiresIn: '1d' }
            )

            return { access_token }
        } catch {
            throw new AppError('Invalid token', 401)
        }
    }
}
