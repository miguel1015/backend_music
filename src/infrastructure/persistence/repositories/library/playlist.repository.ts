import { HttpException, Injectable, Scope } from '@nestjs/common';
import { In, MoreThan, MoreThanOrEqual } from 'typeorm';
import { Playlist } from '@app/domain/library/playlist.entity';
import { PlaylistTrack } from '@app/domain/library/playlist-track.entity';
import { AppContext } from '../../context/appContext.service';

export interface PlaylistStats {
  trackCount: number;
  duration: number;
  covers: string[];
}

const COVERS_PER_PLAYLIST = 4;

@Injectable({ scope: Scope.REQUEST })
export class PlaylistRepository {
  constructor(private readonly _context: AppContext) {}

  private get playlists() {
    return this._context.playlist.getTypeOrmRepository();
  }

  private get tracks() {
    return this._context.playlistTrack.getTypeOrmRepository();
  }

  private fail(error): never {
    throw new HttpException(
      `Error de DB: ${error?.message || ''}`,
      error?.status || 500,
    );
  }

  /**
   * Playlists of the user, last changed first
   * @param userId User id
   */
  async getPlaylists(userId: number): Promise<Playlist[]> {
    try {
      return await this._context.playlist.getAll({
        where: { userId },
        order: { updatedAt: 'DESC', id: 'DESC' },
      });
    } catch (error) {
      this.fail(error);
    }
  }

  async countPlaylists(userId: number): Promise<number> {
    try {
      return await this.playlists.count({ where: { userId } });
    } catch (error) {
      this.fail(error);
    }
  }

  /**
   * Track count, duration and first distinct covers of each playlist
   * @param ids Playlist ids
   */
  async getStats(ids: number[]): Promise<Map<number, PlaylistStats>> {
    const stats = new Map<number, PlaylistStats>(
      ids.map((id) => [id, { trackCount: 0, duration: 0, covers: [] }]),
    );
    if (!ids.length) return stats;

    try {
      const [totals, covers] = await Promise.all([
        this.tracks
          .createQueryBuilder('t')
          .select('t.playlistId', 'playlistId')
          .addSelect('COUNT(*)', 'trackCount')
          .addSelect('COALESCE(SUM(t.duration), 0)', 'duration')
          .where({ playlistId: In(ids) })
          .groupBy('t.playlistId')
          .getRawMany(),
        // Portadas distintas en el orden de la playlist (para el mosaico)
        this.tracks.query(
          `SELECT "playlistId", cover FROM (
             SELECT "playlistId", cover,
               ROW_NUMBER() OVER (PARTITION BY "playlistId" ORDER BY MIN(position)) AS rn
             FROM playlist_tracks
             WHERE "playlistId" = ANY($1) AND cover IS NOT NULL AND cover <> ''
             GROUP BY "playlistId", cover
           ) c
           WHERE rn <= $2
           ORDER BY "playlistId", rn`,
          [ids, COVERS_PER_PLAYLIST],
        ),
      ]);

      totals.forEach((row) => {
        const item = stats.get(Number(row.playlistId));
        if (!item) return;
        item.trackCount = Number(row.trackCount);
        item.duration = Number(row.duration);
      });
      covers.forEach((row) => {
        stats.get(Number(row.playlistId))?.covers.push(row.cover);
      });

      return stats;
    } catch (error) {
      this.fail(error);
    }
  }

  async getPlaylist(id: number): Promise<Playlist | null> {
    try {
      return await this._context.playlist.getOne({ where: { id } });
    } catch (error) {
      this.fail(error);
    }
  }

  async createPlaylist(playlist: Partial<Playlist>): Promise<Playlist> {
    try {
      return await this.playlists.save(this.playlists.create(playlist));
    } catch (error) {
      this.fail(error);
    }
  }

  async updatePlaylist(id: number, changes: Partial<Playlist>): Promise<void> {
    try {
      await this.playlists.update(id, changes);
    } catch (error) {
      this.fail(error);
    }
  }

  /**
   * Mark the playlist as changed (it moves up in the list)
   */
  async touch(id: number): Promise<void> {
    await this.updatePlaylist(id, { updatedAt: new Date() });
  }

  async deletePlaylist(id: number): Promise<void> {
    try {
      await this.playlists.delete(id);
    } catch (error) {
      this.fail(error);
    }
  }

  /**
   * Tracks in order
   * @param playlistId Playlist id
   */
  async getTracks(playlistId: number): Promise<PlaylistTrack[]> {
    try {
      return await this._context.playlistTrack.getAll({
        where: { playlistId },
        order: { position: 'ASC', id: 'ASC' },
      });
    } catch (error) {
      this.fail(error);
    }
  }

  /**
   * Deezer ids already in the playlist
   */
  async getTrackIds(playlistId: number): Promise<number[]> {
    try {
      const rows = await this.tracks.find({
        select: { trackId: true },
        where: { playlistId },
        order: { position: 'ASC' },
      });
      return rows.map((row) => row.trackId);
    } catch (error) {
      this.fail(error);
    }
  }

  /**
   * Insert tracks at a position, moving down the ones after it
   * @param playlistId Playlist id
   * @param rows New tracks (without position)
   * @param position Index where the first one goes
   */
  async insertTracks(
    playlistId: number,
    rows: Partial<PlaylistTrack>[],
    position: number,
  ): Promise<void> {
    if (!rows.length) return;
    try {
      await this.tracks
        .createQueryBuilder()
        .update(PlaylistTrack)
        .set({ position: () => `position + ${rows.length}` })
        .where({ playlistId, position: MoreThanOrEqual(position) })
        .execute();

      await this.tracks
        .createQueryBuilder()
        .insert()
        .into(PlaylistTrack)
        .values(
          rows.map((row, index) => ({
            ...row,
            playlistId,
            position: position + index,
          })),
        )
        .orIgnore()
        .execute();
    } catch (error) {
      this.fail(error);
    }
  }

  /**
   * Remove a track and close the gap it leaves
   * @returns The position it had (null if it was not there)
   */
  async removeTrack(
    playlistId: number,
    trackId: number,
  ): Promise<number | null> {
    try {
      const row = await this.tracks.findOne({ where: { playlistId, trackId } });
      if (!row) return null;

      await this.tracks.delete(row.id);
      await this.tracks
        .createQueryBuilder()
        .update(PlaylistTrack)
        .set({ position: () => 'position - 1' })
        .where({ playlistId, position: MoreThan(row.position) })
        .execute();

      return row.position;
    } catch (error) {
      this.fail(error);
    }
  }

  /**
   * Save a new order
   * @param playlistId Playlist id
   * @param trackIds Every Deezer id of the playlist in the new order
   */
  async reorder(playlistId: number, trackIds: number[]): Promise<void> {
    if (!trackIds.length) return;
    try {
      await this.tracks.query(
        `UPDATE playlist_tracks AS p
         SET position = v.pos - 1
         FROM unnest($2::bigint[]) WITH ORDINALITY AS v("trackId", pos)
         WHERE p."playlistId" = $1 AND p."trackId" = v."trackId"`,
        [playlistId, trackIds],
      );
    } catch (error) {
      this.fail(error);
    }
  }
}
