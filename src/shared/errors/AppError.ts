export class AppError extends Error {
    constructor(
        public readonly message: string,
        public readonly statusCode = 400,
        public readonly errorCode?: string
    ) {
        super(message)
        this.name = 'AppError'
    }
}
