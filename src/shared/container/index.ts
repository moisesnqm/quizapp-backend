import { container } from 'tsyringe'
import { IMailProvider } from './providers/MailProvider/models/IMailProvider'
import { NodemailerProvider } from './providers/MailProvider/NodemailerProvider'
import { IUsersRepository } from '@/modules/users/repositories/IUsersRepository'
import { UsersRepository } from '@/modules/users/repositories/UsersRepository'
import { IQuizzesRepository } from '@/modules/quizzes/repositories/IQuizzesRepository'
import { QuizzesRepository } from '@/modules/quizzes/repositories/QuizzesRepository'
import { IHashProvider } from './providers/HashProvider/models/IHashProvider'
import { BCryptHashProvider } from './providers/HashProvider/BCryptHashProvider'
import { ICacheProvider } from './providers/CacheProvider/models/ICacheProvider'
import { RedisCacheProvider } from './providers/CacheProvider/RedisCacheProvider'

container.registerSingleton<IMailProvider>(
    'MailProvider',
    NodemailerProvider
)

container.registerSingleton<IUsersRepository>(
    'UsersRepository',
    UsersRepository
)

container.registerSingleton<IQuizzesRepository>(
    'QuizzesRepository',
    QuizzesRepository
)

container.registerSingleton<IHashProvider>(
    'HashProvider',
    BCryptHashProvider
)

container.registerSingleton<ICacheProvider>(
    'CacheProvider',
    RedisCacheProvider
) 