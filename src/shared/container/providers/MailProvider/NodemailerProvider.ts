import nodemailer, { Transporter } from 'nodemailer'
import { IMailProvider, ISendMailDTO } from './models/IMailProvider'
import { env } from '../../../../config/env'

export class NodemailerProvider implements IMailProvider {
    private client: Transporter

    constructor() {
        this.client = nodemailer.createTransport({
            host: env.MAIL_HOST,
            port: env.MAIL_PORT,
            auth: {
                user: env.MAIL_USER,
                pass: env.MAIL_PASS,
            },
        })
    }

    async sendMail({ to, subject, template, variables }: ISendMailDTO): Promise<void> {
        const toEmail = typeof to === 'string' ? to : to.email
        
        await this.client.sendMail({
            from: env.MAIL_FROM,
            to: toEmail,
            subject,
            html: template, // Aqui você pode usar um template engine como handlebars
        })
    }
} 