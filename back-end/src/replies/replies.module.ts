import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepliesController } from './replies.controller';
import { RepliesService } from './replies.service';
import { Reply } from './entities/reply.entity';
import { Tweet } from '../tweets/entities/tweet.entity';
import { User } from '../users/entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Reply, Tweet, User]),
    ],
    controllers: [RepliesController],
    providers: [RepliesService],
    exports: [RepliesService],
})
export class RepliesModule { } 