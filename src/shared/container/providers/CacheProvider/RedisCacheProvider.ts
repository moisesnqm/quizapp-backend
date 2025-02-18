import { Redis } from 'ioredis'
import { ICacheProvider } from './models/ICacheProvider'
import { env } from '@/config/env'

export class RedisCacheProvider implements ICacheProvider {
    private client: Redis

    constructor() {
        this.client = new Redis({
            host: env.REDIS_HOST,
            port: env.REDIS_PORT,
            password: env.REDIS_PASS || undefined,
        })
    }

    async set(key: string, value: string, expiresIn?: number): Promise<void> {
        if (expiresIn) {
            await this.client.set(key, value, 'EX', expiresIn)
        } else {
            await this.client.set(key, value)
        }
    }

    async get(key: string): Promise<string | null> {
        return this.client.get(key)
    }

    async del(key: string): Promise<void> {
        await this.client.del(key)
    }
}
