import { AutoMap } from '@automapper/classes';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'users',
})
export class User {
  /**
   * User id
   */
  @PrimaryGeneratedColumn()
  @AutoMap()
  id: number;

  /**
   * User name
   */
  @Column({ length: 255 })
  @AutoMap()
  name: string;

  /**
   * User email
   */
  @Column({ length: 255, unique: true })
  @AutoMap()
  email: string;

  /**
   * User password (bcrypt hash)
   */
  @Column({ length: 255 })
  password: string;

  /**
   * Profile image in base64
   */
  @Column({ type: 'text' })
  @AutoMap()
  perfilImage: string;

  /**
   * Subscription plan: trial | premium | family
   */
  @Column({ length: 20, default: 'trial' })
  @AutoMap()
  plan: string;

  /**
   * End of the free trial (null: 30 days after createdAt)
   */
  @Column({ type: 'timestamp', nullable: true })
  trialEndsAt?: Date;

  /**
   * Create user date
   */
  @CreateDateColumn()
  @AutoMap()
  createdAt?: Date;

  /**
   * Update user date
   */
  @UpdateDateColumn()
  @AutoMap()
  updatedAt?: Date;

  /**
   * Delete user date
   */
  @DeleteDateColumn()
  deletedAt?: Date;
}
