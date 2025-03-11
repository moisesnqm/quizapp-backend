import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { randomUUID } from 'crypto'
import { Quiz } from './Quiz'

@Entity('campaigns')
export class Campaign {
    @PrimaryColumn('uuid')
    id: string

    @Column('varchar')
    name: string

    @Column('varchar', { nullable: true })
    subject: string

    @Column('varchar')
    status: 'Pendente' | 'Em Andamento' | 'Concluída' | 'Cancelada'

    @Column('timestamp')
    startDate: Date

    @Column('timestamp')
    endDate: Date

    @Column('varchar')
    owner: string

    @ManyToMany(() => Quiz)
    @JoinTable({
        name: 'campaigns_quizzes',
        joinColumn: { name: 'campaign_id' },
        inverseJoinColumn: { name: 'quiz_id' }
    })
    quizzes: Quiz[]

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date

    constructor() {
        if (!this.id) {
            this.id = randomUUID()
        }
    }
} 