import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type: "varchar", unique: true, length:320})
    email: string;

    @Column({name: "password_hash", type: "varchar", length: 255, nullable: true})
    passwordHash: string;

    @CreateDateColumn({name: "created_at", type: "timestamptz"})
    createdAt: Date;

    @UpdateDateColumn({name: "updated_at", type: "timestamptz"})
    updatedAt: Date;
}
