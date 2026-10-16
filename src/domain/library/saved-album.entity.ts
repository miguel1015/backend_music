import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { bigintToNumber } from './track-columns';

@Entity({
  name: 'saved_albums',
})
@Index(['userId', 'albumId'], { unique: true })
export class SavedAlbum {
  /**
   * Row id
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
   * Deezer album id
   */
  @Column({ type: 'bigint', transformer: bigintToNumber })
  albumId: number;

  /**
   * Album title
   */
  @Column({ length: 255 })
  title: string;

  /**
   * Album cover url
   */
  @Column({ type: 'text', nullable: true })
  cover?: string;

  /**
   * Deezer artist id
   */
  @Column({ type: 'bigint', transformer: bigintToNumber })
  artistId: number;

  /**
   * Artist name
   */
  @Column({ length: 255 })
  artistName: string;

  /**
   * album | single | ep | compile
   */
  @Column({ length: 20, nullable: true })
  recordType?: string;

  /**
   * Release date (YYYY-MM-DD)
   */
  @Column({ length: 10, nullable: true })
  releaseDate?: string;

  /**
   * Date it was saved
   */
  @CreateDateColumn()
  createdAt?: Date;
}
