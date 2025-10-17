import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('market_reports')
export class MarketReport {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ nullable: true })
  date: string; // 2025-10-06

  @Column({ nullable: true })
  market: string; // Ej: SH, GD, etc.

  @Column({ nullable: true })
  origin: string; // Ej: South Africa, Peru

  @Column({ nullable: true })
  item: string; // Ej: Orange, Blueberry

  @Column({ nullable: true })
  exporter: string; // Ej: 鑫荣懋

  @Column({ nullable: true })
  variety: string; // Ej: MIDKNIGHT

  @Column({ nullable: true })
  packaging: string; // Ej: 15KG, 18KG

  @Column({ nullable: true })
  weight: string;
  
  @Column({ nullable: true })
  size: string; // Ej: 56#, 64#, 80#

  @Column({ type: 'float', nullable: true })
  price: number; // Ej: 120, 130, 340...

  @Column({ nullable: true })
  movement: string; // Ej: 走5板, 清, 不动, 剩8板

  @Column({ nullable: true })
  notes: string; // comentarios adicionales si hay
}
