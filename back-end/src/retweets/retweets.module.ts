import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RetweetsController } from './retweets.controller';
import { RetweetsService } from './retweets.service';
import { Retweet } from './entities/retweet.entity';
import { Tweet } from '../tweets/entities/tweet.entity';
import { User } from '../users/entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Retweet, Tweet, User]),
    ],
    controllers: [RetweetsController],
    providers: [RetweetsService],
    exports: [RetweetsService],
})
export class RetweetsModule { } 