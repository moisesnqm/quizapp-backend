import { Entity, Column, PrimaryColumn, CreateDateColumn } from "typeorm";
import { nanoid } from 'nanoid';

// Tamanho padrão do ID NanoID
const NANOID_SIZE = 8;

@Entity("quizzes")
export class Quiz {
    @PrimaryColumn("varchar", { length: NANOID_SIZE })
    id!: string;

    @Column("varchar")
    title!: string;

    @Column("varchar", { nullable: true })
    subject!: string;

    @Column("varchar")
    description!: string;

    @Column("varchar")
    managerId!: string;

    @Column("jsonb")
    content!: any;

    @Column("varchar")
    status!: string;

    @Column("varchar", { nullable: true })
    country!: string;

    @Column("varchar", { nullable: true })
    theme!: string;

    @Column("timestamp")
    startDate!: Date;

    @Column("timestamp")
    endDate!: Date;

    @CreateDateColumn()
    createdAt!: Date;
    
    /**
     * Gera um novo ID NanoID
     * @param size Tamanho do ID (padrão: 8 caracteres)
     * @returns Novo ID NanoID
     */
    static generateId(size: number = NANOID_SIZE): string {
        return nanoid(size);
    }
}