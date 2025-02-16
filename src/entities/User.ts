import { Entity, Column, PrimaryColumn } from "typeorm"

@Entity("users")
export class User {
    @PrimaryColumn("uuid")
    id!: string

    @Column("varchar")
    name!: string

    @Column("varchar", { unique: true })
    email!: string

    @Column("varchar")
    password!: string

    @Column("varchar", { default: "member" })
    role!: "admin" | "member"
} 