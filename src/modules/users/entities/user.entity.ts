import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    @ApiProperty({ format: 'uuid' })
    id: string;

    @Column({type: "varchar", unique: true, length:320})
    @ApiProperty({ format: 'email', example: 'user@example.com' })
    email: string;

    @CreateDateColumn({name: "created_at", type: "timestamptz"})
    @ApiProperty()
    createdAt: Date;

    @UpdateDateColumn({name: "updated_at", type: "timestamptz"})
    @ApiProperty()
    updatedAt: Date;
}
