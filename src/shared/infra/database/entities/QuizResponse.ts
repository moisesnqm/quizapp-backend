import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm'
import { randomUUID } from 'crypto'

@Entity('quiz_responses')
export class QuizResponse {
    @PrimaryColumn('uuid')
    id: string

    @Column('uuid')
    uuid: string

    @Column('uuid')
    campaignId: string

    @Column('varchar', { length: 8 })
    quizId: string

    @Column('jsonb')
    content: any

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date

    constructor() {
        if (!this.id) {
            this.id = randomUUID()
        }
    }
}