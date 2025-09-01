import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tweet } from '../../tweets/entities/tweet.entity';
import { PollOption } from './poll-option.entity';

@Entity('polls')
export class Poll {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', nullable: false })
    tweet_id: string;

    @Column({ type: 'uuid', nullable: false })
    user_id: string;

    @CreateDateColumn()
    created_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    expires_at: Date | null;

    @ManyToOne(() => Tweet, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tweet_id' })
    tweet: Tweet;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    creator: User;

    @OneToMany(() => PollOption, option => option.poll, { cascade: true })
    options: PollOption[];
} 