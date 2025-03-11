import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { randomUUID } from 'crypto'

@Entity('market_niches')
export class MarketNiche {
    @PrimaryColumn('uuid')
    id: string

    @Column('varchar')
    name: string

    @CreateDateColumn({ type: 'timestamp' } )
    createdAt: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date

    constructor() {
        if (!this.id) {
            this.id = randomUUID()
        }
    }
} 