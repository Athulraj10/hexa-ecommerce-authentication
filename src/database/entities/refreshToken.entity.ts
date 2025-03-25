import { Entity, PrimaryGeneratedColumn, Column , CreateDateColumn } from 'typeorm';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn("uuid")
  id: string; 

  @Column()
  refreshToken: string;

  @Column()
  userId:string

  @CreateDateColumn()
  createdAt: Date;
}

