import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { bigintToNumber } from './track-columns';

@Entity({
  name: 'followed_artists',
})
@Index(['userId', 'artistId'], { unique: true })
export class FollowedArtist {
  /**
   * Row id
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Follower
   */
  @Index()
  @Column()
  userId: number;

  /**
   * Deezer artist id
   */
  @Column({ type: 'bigint', transformer: bigintToNumber })
  artistId: number;

  /**
   * Artist name
   */
  @Column({ length: 255 })
  name: string;

  /**
   * Artist picture url
   */
  @Column({ type: 'text', nullable: true })
  picture?: string;

  /**
   * Date it was followed
   */
  @CreateDateColumn()
  createdAt?: Date;
}
