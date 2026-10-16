import { AutoMap } from '@automapper/classes';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  ValueTransformer,
} from 'typeorm';

/**
 * Los IDs de Deezer superan el rango de int: se guardan como bigint y
 * Postgres los devuelve como texto
 */
const bigintToNumber: ValueTransformer = {
  to: (value?: number) => value,
  from: (value?: string | null) => (value == null ? value : Number(value)),
};

@Entity({
  name: 'play_history',
})
export class PlayHistory {
  /**
   * Play id
   */
  @PrimaryGeneratedColumn()
  @AutoMap()
  id: number;

  /**
   * User who listened
   */
  @Index()
  @Column()
  @AutoMap()
  userId: number;

  /**
   * Deezer track id
   */
  @Column({ type: 'bigint', transformer: bigintToNumber })
  @AutoMap()
  trackId: number;

  /**
   * Track title
   */
  @Column({ length: 255 })
  @AutoMap()
  title: string;

  /**
   * Deezer artist id
   */
  @Column({ type: 'bigint', transformer: bigintToNumber })
  @AutoMap()
  artistId: number;

  /**
   * Artist name
   */
  @Column({ length: 255 })
  @AutoMap()
  artistName: string;

  /**
   * Artist picture url
   */
  @Column({ type: 'text', nullable: true })
  @AutoMap()
  artistPicture?: string;

  /**
   * Album cover url
   */
  @Column({ type: 'text', nullable: true })
  @AutoMap()
  cover?: string;

  /**
   * Preview url (Deezer renews it, the player asks again when it expires)
   */
  @Column({ type: 'text', nullable: true })
  @AutoMap()
  preview?: string;

  /**
   * Seconds listened
   */
  @Column({ type: 'int', default: 0 })
  @AutoMap()
  seconds: number;

  /**
   * Day in the user's timezone (YYYY-MM-DD), for streaks and activity
   */
  @Column({ length: 10 })
  @AutoMap()
  localDate: string;

  /**
   * Hour in the user's timezone (0-23)
   */
  @Column({ type: 'smallint' })
  @AutoMap()
  localHour: number;

  /**
   * Play date
   */
  @CreateDateColumn()
  @AutoMap()
  playedAt?: Date;
}
