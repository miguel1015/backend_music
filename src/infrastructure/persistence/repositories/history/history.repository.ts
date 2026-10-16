import { HttpException, Injectable, Scope } from '@nestjs/common';
import { MoreThanOrEqual } from 'typeorm';
import { PlayHistory } from '@app/domain/history/play-history.entity';
import { AppContext } from '../../context/appContext.service';

export interface HistoryTotals {
  plays: number;
  seconds: number;
  artists: number;
  tracks: number;
  nightPlays: number;
}

@Injectable({ scope: Scope.REQUEST })
export class HistoryRepository {
  constructor(private readonly _context: AppContext) {}

  private get repository() {
    return this._context.playHistory.getTypeOrmRepository();
  }

  private fail(error): never {
    throw new HttpException(
      `Error de DB: ${error?.message || ''}`,
      error?.status || 500,
    );
  }

  /**
   * Save a play
   * @param play Play
   */
  async createPlay(play: PlayHistory): Promise<PlayHistory> {
    try {
      const playData = await this._context.playHistory.create(play);
      return { ...play, ...playData?.raw[0], ...playData?.generatedMaps[0] };
    } catch (error) {
      this.fail(error);
    }
  }

  /**
   * Totals of the user
   * @param userId User id
   */
  async getTotals(userId: number): Promise<HistoryTotals> {
    try {
      const raw = await this.repository
        .createQueryBuilder('h')
        .select('COUNT(*)', 'plays')
        .addSelect('COALESCE(SUM(h.seconds), 0)', 'seconds')
        .addSelect('COUNT(DISTINCT h.artistId)', 'artists')
        .addSelect('COUNT(DISTINCT h.trackId)', 'tracks')
        .addSelect(
          'COALESCE(SUM(CASE WHEN h.localHour < 5 THEN 1 ELSE 0 END), 0)',
          'nightPlays',
        )
        .where('h.userId = :userId', { userId })
        .getRawOne();

      return {
        plays: Number(raw?.plays ?? 0),
        seconds: Number(raw?.seconds ?? 0),
        artists: Number(raw?.artists ?? 0),
        tracks: Number(raw?.tracks ?? 0),
        nightPlays: Number(raw?.nightPlays ?? 0),
      };
    } catch (error) {
      this.fail(error);
    }
  }

  /**
   * Most played artists
   * @param userId User id
   * @param limit Max results
   */
  async getTopArtists(userId: number, limit = 5) {
    try {
      const rows = await this.repository
        .createQueryBuilder('h')
        .select('h.artistId', 'id')
        .addSelect('MAX(h.artistName)', 'name')
        .addSelect('MAX(h.artistPicture)', 'picture')
        .addSelect('COUNT(*)', 'plays')
        .where('h.userId = :userId', { userId })
        .groupBy('h.artistId')
        .orderBy('COUNT(*)', 'DESC')
        .addOrderBy('MAX(h.playedAt)', 'DESC')
        .limit(limit)
        .getRawMany();

      return rows.map((row) => ({
        id: Number(row.id),
        name: row.name,
        picture: row.picture ?? undefined,
        plays: Number(row.plays),
      }));
    } catch (error) {
      this.fail(error);
    }
  }

  /**
   * Most played tracks
   * @param userId User id
   * @param limit Max results
   */
  async getTopTracks(userId: number, limit = 5) {
    try {
      const rows = await this.repository
        .createQueryBuilder('h')
        .select('h.trackId', 'id')
        .addSelect('MAX(h.title)', 'title')
        .addSelect('MAX(h.artistId)', 'artistId')
        .addSelect('MAX(h.artistName)', 'artistName')
        .addSelect('MAX(h.cover)', 'cover')
        .addSelect('MAX(h.preview)', 'preview')
        .addSelect('COUNT(*)', 'plays')
        .where('h.userId = :userId', { userId })
        .groupBy('h.trackId')
        .orderBy('COUNT(*)', 'DESC')
        .addOrderBy('MAX(h.playedAt)', 'DESC')
        .limit(limit)
        .getRawMany();

      return rows.map((row) => ({
        id: Number(row.id),
        title: row.title,
        artistId: Number(row.artistId),
        artistName: row.artistName,
        cover: row.cover ?? undefined,
        preview: row.preview ?? undefined,
        plays: Number(row.plays),
      }));
    } catch (error) {
      this.fail(error);
    }
  }

  /**
   * Distinct tracks listened lately, last played first
   * @param userId User id
   * @param limit Max results
   */
  async getRecentTracks(userId: number, limit = 30) {
    try {
      const rows = await this.trackQuery(userId)
        .orderBy('MAX(h.playedAt)', 'DESC')
        .limit(limit)
        .getRawMany();

      return rows.map(this.toTrack);
    } catch (error) {
      this.fail(error);
    }
  }

  /**
   * Tracks played several times that the user has not heard since a date
   * @param userId User id
   * @param before YYYY-MM-DD
   * @param limit Max results
   */
  async getForgottenTracks(userId: number, before: string, limit = 30) {
    try {
      const rows = await this.trackQuery(userId)
        .having('COUNT(*) >= 2')
        .andHaving('MAX(h.localDate) < :before', { before })
        .orderBy('COUNT(*)', 'DESC')
        .addOrderBy('MAX(h.playedAt)', 'DESC')
        .limit(limit)
        .getRawMany();

      return rows.map(this.toTrack);
    } catch (error) {
      this.fail(error);
    }
  }

  private trackQuery(userId: number) {
    return this.repository
      .createQueryBuilder('h')
      .select('h.trackId', 'id')
      .addSelect('MAX(h.title)', 'title')
      .addSelect('MAX(h.artistId)', 'artistId')
      .addSelect('MAX(h.artistName)', 'artistName')
      .addSelect('MAX(h.cover)', 'cover')
      .addSelect('MAX(h.preview)', 'preview')
      .addSelect('COUNT(*)', 'plays')
      .where('h.userId = :userId', { userId })
      .groupBy('h.trackId');
  }

  private toTrack = (row) => ({
    id: Number(row.id),
    title: row.title,
    artistId: Number(row.artistId),
    artistName: row.artistName,
    cover: row.cover ?? undefined,
    preview: row.preview ?? undefined,
    plays: Number(row.plays),
  });

  /**
   * Last plays
   * @param userId User id
   * @param limit Max results
   */
  async getRecent(userId: number, limit = 10): Promise<PlayHistory[]> {
    try {
      return await this._context.playHistory.getAll({
        where: { userId },
        order: { playedAt: 'DESC' },
        take: limit,
      });
    } catch (error) {
      this.fail(error);
    }
  }

  /**
   * Days with plays, newest first
   * @param userId User id
   */
  async getDays(userId: number): Promise<string[]> {
    try {
      const rows = await this.repository
        .createQueryBuilder('h')
        .select('DISTINCT h.localDate', 'date')
        .where('h.userId = :userId', { userId })
        .orderBy('h.localDate', 'DESC')
        .getRawMany();

      return rows.map((row) => row.date);
    } catch (error) {
      this.fail(error);
    }
  }

  /**
   * Plays per day since a date
   * @param userId User id
   * @param from YYYY-MM-DD
   */
  async getActivity(userId: number, from: string) {
    try {
      const rows = await this.repository
        .createQueryBuilder('h')
        .select('h.localDate', 'date')
        .addSelect('COUNT(*)', 'plays')
        .where({ userId, localDate: MoreThanOrEqual(from) })
        .groupBy('h.localDate')
        .getRawMany();

      return rows.map((row) => ({ date: row.date, plays: Number(row.plays) }));
    } catch (error) {
      this.fail(error);
    }
  }

  /**
   * Delete the whole history of a user
   * @param userId User id
   */
  async clearHistory(userId: number): Promise<number> {
    try {
      const result = await this.repository.delete({ userId });
      return result.affected ?? 0;
    } catch (error) {
      this.fail(error);
    }
  }
}
