import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { CloudinaryService } from "./cloudinary.service";
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './entities/user.entity';
import { UserMapper } from './mappers/user.mapper';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule
  ],
  controllers: [UsersController],
  providers: [UsersService, CloudinaryService, UserMapper],
  exports: [UsersService, CloudinaryService, UserMapper],
})
export class UsersModule { }