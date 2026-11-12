import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type: "varchar", unique: true, length:320})
    email: string;

    @CreateDateColumn({name: "created_at", type: "timestamptz"})
    createdAt: Date;

    @UpdateDateColumn({name: "updated_at", type: "timestamptz"})
    updatedAt: Date;
}
