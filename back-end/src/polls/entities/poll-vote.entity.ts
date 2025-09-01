import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Poll } from './poll.entity';
import { PollOption } from './poll-option.entity';

@Entity('poll_votes')
export class PollVote {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', nullable: false })
    poll_id: string;

    @Column({ type: 'uuid', nullable: false })
    option_id: string;

    @Column({ type: 'uuid', nullable: false })
    user_id: string;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => Poll, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'poll_id' })
    poll: Poll;

    @ManyToOne(() => PollOption, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'option_id' })
    option: PollOption;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    voter: User;
} 