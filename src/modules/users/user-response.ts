import { User } from "./entities/user.entity.js";

export interface UserResponse {
    id: string;
    email: string;
    createdAt: Date;
}

export function toUserResponse(user: User): UserResponse {
    return {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
    }
}