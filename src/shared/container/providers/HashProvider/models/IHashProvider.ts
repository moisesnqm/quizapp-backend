export interface IHashProvider {
    compareHash(payload: string, hashed: string): Promise<boolean>
    generateHash(payload: string): Promise<string>
} 