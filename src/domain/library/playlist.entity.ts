import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlaylistTrack } from './playlist-track.entity';

@Entity({
  name: 'playlists',
})
export class Playlist {
  /**
   * Playlist id
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
   * Name
   */
  @Column({ length: 80 })
  name: string;

  /**
   * Description
   */
  @Column({ type: 'text', nullable: true })
  description?: string;

  /**
   * Anyone with the link can see it
   */
  @Column({ default: false })
  isPublic: boolean;

  /**
   * Tracks
   */
  @OneToMany(() => PlaylistTrack, (track) => track.playlist)
  tracks?: PlaylistTrack[];

  /**
   * Create date
   */
  @CreateDateColumn()
  createdAt?: Date;

  /**
   * Last change (also when tracks are added, removed or moved)
   */
  @UpdateDateColumn()
  updatedAt?: Date;
}
