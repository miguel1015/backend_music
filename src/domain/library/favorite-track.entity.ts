import {
  CreateDateColumn,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TrackColumns } from './track-columns';

@Entity({
  name: 'favorite_tracks',
})
@Index(['userId', 'trackId'], { unique: true })
export class FavoriteTrack extends TrackColumns {
  /**
   * Favorite id
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Owner
   */
  @Index()
  @Column()
  userId: number;

  /**
   * Date it was saved
   */
  @CreateDateColumn()
  createdAt?: Date;
}
