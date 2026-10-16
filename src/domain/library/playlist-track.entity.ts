import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TrackColumns } from './track-columns';
import { Playlist } from './playlist.entity';

@Entity({
  name: 'playlist_tracks',
})
@Index(['playlistId', 'trackId'], { unique: true })
export class PlaylistTrack extends TrackColumns {
  /**
   * Row id
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Playlist
   */
  @Index()
  @Column()
  playlistId: number;

  @ManyToOne(() => Playlist, (playlist) => playlist.tracks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'playlistId' })
  playlist?: Playlist;

  /**
   * Order inside the playlist (0 first)
   */
  @Column({ type: 'int' })
  position: number;

  /**
   * Date it was added
   */
  @CreateDateColumn()
  addedAt?: Date;
}
