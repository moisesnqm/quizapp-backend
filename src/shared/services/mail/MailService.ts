import nodemailer from 'nodemailer'
import { z } from 'zod'
import fs from 'fs/promises'
import path from 'path'

const mailConfigSchema = z.object({
    host: z.string(),
    port: z.number(),
    auth: z.object({
        user: z.string(),
        pass: z.string()
    }),
    from: z.string()
})

type MailConfig = z.infer<typeof mailConfigSchema>

interface SendMailDTO {
    to: string
    subject: string
    template: string
    variables: Record<string, any>
}

export class MailService {
    private transporter: nodemailer.Transporter
    private config: MailConfig

    constructor(config: MailConfig) {
        this.config = mailConfigSchema.parse(config)
        console.log('Initializing mail service with config:', {
            host: config.host,
            port: config.port,
            user: config.auth.user,
            from: config.from
        })

        this.transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: true, // true para 465, false para outras portas
            auth: {
                user: config.auth.user,
                pass: config.auth.pass
            },
            tls: {
                rejectUnauthorized: true // Aceita certificados auto-assinados
            }
        })
    }

    async send({ to, subject, template, variables }: SendMailDTO): Promise<void> {
        try {
            console.log('Starting email send process...')
            
            const templatePath = path.resolve(__dirname, 'templates', `${template}.html`)
            console.log('Template path:', templatePath)
            
            console.log('Checking if template exists...')
            const exists = await fs.access(templatePath).then(() => true).catch(() => false)
            if (!exists) {
                throw new Error(`Template file not found at: ${templatePath}`)
            }
            
            let html = await fs.readFile(templatePath, 'utf-8')
            console.log('Template loaded successfully')
            
            // Replace variables in template
            Object.entries(variables).forEach(([key, value]) => {
                html = html.replace(new RegExp(`{{${key}}}`, 'g'), value)
            })
            console.log('Variables replaced in template')

            console.log('Preparing to send email:', {
                from: this.config.from,
                to,
                subject,
                templateLength: html.length
            })

            // Verify connection configuration
            console.log('Verifying SMTP connection...')
            await this.transporter.verify()
            console.log('SMTP connection verified successfully')

            const result = await this.transporter.sendMail({
                from: this.config.from,
                to,
                subject,
                html
            })

            console.log('Email sent successfully:', {
                messageId: result.messageId,
                response: result.response
            })
        } catch (error) {
            console.error('Detailed error sending email:', {
                error: error instanceof Error ? {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                } : error
            })
            throw new Error('Failed to send email: ' + (error instanceof Error ? error.message : 'Unknown error'))
        }
    }
} 