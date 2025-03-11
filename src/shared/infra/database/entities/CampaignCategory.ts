import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { randomUUID } from 'crypto'

@Entity('campaign_categories')
export class CampaignCategory {
    @PrimaryColumn('uuid')
    id: string

    @Column('varchar')
    name: string

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