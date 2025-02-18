export interface ICacheProvider {
    set(key: string, value: string, expiresIn?: number): Promise<void>
    get(key: string): Promise<string | null>
    del(key: string): Promise<void>
} 