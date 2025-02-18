interface IMailContact {
    name?: string
    email: string
}

interface IMailTemplate {
    template: string
    variables: Record<string, unknown>
}

export interface ISendMailDTO {
    to: IMailContact | string
    subject: string
    template: string
    variables: Record<string, unknown>
}

export interface IMailProvider {
    sendMail(data: ISendMailDTO): Promise<void>
}
