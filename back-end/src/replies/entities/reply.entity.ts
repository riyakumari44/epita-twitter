import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tweet } from '../../tweets/entities/tweet.entity';

@Entity('replies')
export class Reply {
    @PrimaryGeneratedColumn('uuid')
    reply_id: string;

    @Column({ type: 'uuid', nullable: false })
    tweet_id: string;

    @Column({ type: 'uuid', nullable: false })
    user_id: string;

    @Column({ type: 'text', nullable: false })
    reply_text: string;

    @CreateDateColumn()
    timestamp: Date;

    @ManyToOne(() => Tweet, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tweet_id' })
    tweet: Tweet;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
} 