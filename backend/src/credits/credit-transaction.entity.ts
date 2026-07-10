import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type CreditTransactionType = 'grant' | 'debit' | 'refund' | 'adjustment';

@Entity('credit_transactions')
export class CreditTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  type: CreditTransactionType;

  /** Positive for grants/refunds, negative for debits. */
  @Column('int')
  amount: number;

  @Column({ nullable: true })
  videoJobId?: string;

  @Column({ nullable: true })
  reason?: string;

  @CreateDateColumn()
  createdAt: Date;
}
