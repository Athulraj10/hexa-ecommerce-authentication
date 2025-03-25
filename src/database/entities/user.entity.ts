// src/entities/user.entity.ts
import { UserRole } from 'src/services/Enums.role';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string; 

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
  
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({default: UserRole.USER})
  permissions:string;
}