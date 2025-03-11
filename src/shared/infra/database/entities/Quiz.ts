import { Entity, Column, PrimaryColumn, CreateDateColumn } from "typeorm";

@Entity("quizzes")
export class Quiz {
    @PrimaryColumn("uuid")
    id!: string;

    @Column("varchar")
    name!: string;

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

    @Column("timestamp")
    startDate!: Date;

    @Column("timestamp")
    endDate!: Date;

    @CreateDateColumn()
    createdAt!: Date;
}