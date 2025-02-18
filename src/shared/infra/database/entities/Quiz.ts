import { Entity, Column, PrimaryColumn, CreateDateColumn } from "typeorm";

@Entity("quizzes")
export class Quiz {
    @PrimaryColumn("varchar")
    id!: string;

    @Column("varchar")
    title!: string;

    @Column("varchar")
    description!: string;

    @Column("varchar")
    managerId!: string;

    @Column("jsonb")
    content!: any;

    @CreateDateColumn()
    createdAt!: Date;
}