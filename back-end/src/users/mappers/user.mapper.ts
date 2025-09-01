import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';

@Injectable()
export class UserMapper {
    toDto(user: User) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
