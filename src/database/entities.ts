import { RefreshToken } from '../modules/auth/entities/refresh-token.entity.js';
import { Session } from '../modules/auth/entities/session.entity.js';
import { User } from '../modules/users/entities/user.entity.js';

export const entities = [User, Session, RefreshToken];
