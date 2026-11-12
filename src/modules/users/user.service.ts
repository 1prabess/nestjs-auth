import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>
    ){}

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOneBy({email}) 
    }

    async findById(id: string): Promise<User | null> {
        return this.usersRepository.findOneBy({id})
    }

    async create(email: string, passwordHash:string): Promise<User> {
        const existingUser = await this.usersRepository.findOneBy({email})

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const user = this.usersRepository.create({
            email,
            passwordHash
        })

        return this.usersRepository.save(user);
    }
}
