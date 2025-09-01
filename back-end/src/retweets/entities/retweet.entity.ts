import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tweet } from '../../tweets/entities/tweet.entity';

@Entity('retweets')
export class Retweet {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', nullable: false })
    tweet_id: string;

    @Column({ type: 'uuid', nullable: false })
    user_id: string;

    @Column({ type: 'text', nullable: true })
    comment: string | null;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => Tweet, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tweet_id' })
    tweet: Tweet;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
} 