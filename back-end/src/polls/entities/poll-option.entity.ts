import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Poll } from './poll.entity';
import { PollVote } from './poll-vote.entity';

@Entity('poll_options')
export class PollOption {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', nullable: false })
    poll_id: string;

    @Column({ type: 'text', nullable: false })
    option_text: string;

    @ManyToOne(() => Poll, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'poll_id' })
    poll: Poll;

    @OneToMany(() => PollVote, vote => vote.option)
    votes: PollVote[];
} 