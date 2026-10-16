export class StatsArtistDto {
  id: number;
  name: string;
  picture?: string;
  plays: number;
}

export class StatsTrackDto {
  id: number;
  title: string;
  artistId: number;
  artistName: string;
  cover?: string;
  preview?: string;
  plays: number;
}

export class StatsRecentDto extends StatsTrackDto {
  playedAt: Date;
}

export class StatsDayDto {
  /**
   * YYYY-MM-DD
   */
  date: string;
  plays: number;
}

export class StatsResponseDto {
  /**
   * Plays, seconds listened, distinct artists and tracks, plays before 5 a. m.
   */
  totals: {
    plays: number;
    seconds: number;
    artists: number;
    tracks: number;
    nightPlays: number;
  };

  /**
   * Consecutive days with at least one play
   */
  streak: {
    current: number;
    best: number;
  };

  /**
   * Plays per day for the last 14 days (oldest first)
   */
  activity: StatsDayDto[];

  topArtists: StatsArtistDto[];

  topTracks: StatsTrackDto[];

  recent: StatsRecentDto[];
}
