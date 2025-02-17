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
    info!: {
        text: string;
        options: {
            text: string;
            isCorrect: boolean;
        }[];
    }[];

    @CreateDateColumn()
    createdAt!: Date;
}