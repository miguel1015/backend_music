import { Injectable } from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { HistoryRepository } from '@app/infrastructure/persistence/repositories/history/history.repository';
import { PlayHistory } from '@app/domain/history/play-history.entity';
import { HistoryRequestDto } from '@app/domain/history/dto/history-request.dto';
import { StatsResponseDto } from '@app/domain/history/dto/stats-response.dto';
import { MixDto } from '@app/domain/library/dto/library-response.dto';

const ACTIVITY_DAYS = 14;
// "Redescubre": canciones que no suenan desde hace este tiempo
const REDISCOVER_DAYS = 21;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/*
Fechas YYYY-MM-DD sin zona horaria: se opera en UTC para no correr el día
*/
const toDate = (day: string) => new Date(`${day}T00:00:00Z`);
const toDay = (date: Date) => date.toISOString().slice(0, 10);
const addDays = (day: string, amount: number) => {
  const date = toDate(day);
  date.setUTCDate(date.getUTCDate() + amount);
  return toDay(date);
};

/**
 * History services
 */
@Injectable()
export class HistoryServices {
  constructor(
    private readonly _historyRepository: HistoryRepository,
    @InjectMapper() private readonly _mapper: Mapper,
  ) {}

  /**
   * Save a play of the user
   * @param userId
   * @param historyDto
   */
  async record(userId: number, historyDto: HistoryRequestDto) {
    const play = this._mapper.map(historyDto, HistoryRequestDto, PlayHistory);
    play.userId = userId;

    const saved = await this._historyRepository.createPlay(play);

    return { id: saved.id };
  }

  /**
   * Listening stats of the user
   * @param userId
   * @param today Day in the user's timezone (YYYY-MM-DD)
   */
  async stats(userId: number, today?: string): Promise<StatsResponseDto> {
    const day = today && DATE_PATTERN.test(today) ? today : toDay(new Date());
    const from = addDays(day, -(ACTIVITY_DAYS - 1));

    const [totals, topArtists, topTracks, recent, days, activity] =
      await Promise.all([
        this._historyRepository.getTotals(userId),
        this._historyRepository.getTopArtists(userId),
        this._historyRepository.getTopTracks(userId),
        this._historyRepository.getRecent(userId),
        this._historyRepository.getDays(userId),
        this._historyRepository.getActivity(userId, from),
      ]);

    const playsByDay = new Map(activity.map((item) => [item.date, item.plays]));

    return {
      totals,
      streak: this.getStreak(days, day),
      activity: Array.from({ length: ACTIVITY_DAYS }, (_, index) => {
        const date = addDays(from, index);
        return { date, plays: playsByDay.get(date) ?? 0 };
      }),
      topArtists,
      topTracks,
      recent: recent.map((play) => ({
        id: play.trackId,
        title: play.title,
        artistId: play.artistId,
        artistName: play.artistName,
        cover: play.cover,
        preview: play.preview,
        plays: 1,
        playedAt: play.playedAt,
      })),
    };
  }

  /**
   * Automatic playlists built from the history: most played, recently played
   * and played a lot but not in the last weeks
   * @param userId
   * @param today Day in the user's timezone (YYYY-MM-DD)
   */
  async mixes(userId: number, today?: string): Promise<MixDto[]> {
    const day = today && DATE_PATTERN.test(today) ? today : toDay(new Date());

    const [top, recent, rediscover] = await Promise.all([
      this._historyRepository.getTopTracks(userId, 30),
      this._historyRepository.getRecentTracks(userId, 30),
      this._historyRepository.getForgottenTracks(
        userId,
        addDays(day, -REDISCOVER_DAYS),
      ),
    ]);

    return [
      { id: 'top', tracks: top },
      { id: 'recent', tracks: recent },
      { id: 'rediscover', tracks: rediscover },
    ];
  }

  /**
   * Delete the history of the user
   * @param userId
   */
  async clear(userId: number) {
    const deleted = await this._historyRepository.clearHistory(userId);

    return { deleted };
  }

  /**
   * Current streak (counts if the user listened today or yesterday) and best
   * streak
   * @param days Days with plays, newest first
   * @param today YYYY-MM-DD
   */
  private getStreak(days: string[], today: string) {
    let best = 0;
    let run = 0;
    let previous: string | null = null;

    for (const day of days) {
      run = previous && addDays(day, 1) === previous ? run + 1 : 1;
      best = Math.max(best, run);
      previous = day;
    }

    let current = 0;
    const latest = days[0];
    if (latest === today || latest === addDays(today, -1)) {
      current = 1;
      while (days[current] === addDays(latest, -current)) current++;
    }

    return { current, best };
  }
}
