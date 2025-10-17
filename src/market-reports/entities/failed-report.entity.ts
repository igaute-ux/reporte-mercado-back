import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class FailedReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  rawMessage: string;

  @CreateDateColumn()
  createdAt: Date;
}
