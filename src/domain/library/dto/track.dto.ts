import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Canción de Deezer tal como la guarda la biblioteca
 */
export class TrackDto {
  /**
   * Deezer track id
   */
  @IsInt()
  @Min(1)
  trackId: number;

  /**
   * Track title
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  /**
   * Deezer artist id
   */
  @IsInt()
  @Min(1)
  artistId: number;

  /**
   * Artist name
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  artistName: string;

  /**
   * Artist picture url
   */
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  artistPicture?: string;

  /**
   * Deezer album id
   */
  @IsInt()
  @IsOptional()
  albumId?: number;

  /**
   * Album title
   */
  @IsString()
  @IsOptional()
  @MaxLength(255)
  albumTitle?: string;

  /**
   * Album cover url
   */
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  cover?: string;

  /**
   * Duration in seconds
   */
  @IsInt()
  @Min(0)
  @Max(36000)
  @IsOptional()
  duration?: number;

  /**
   * Preview url
   */
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  preview?: string;

  /**
   * Explicit lyrics
   */
  @IsBoolean()
  @IsOptional()
  explicit?: boolean;
}

/**
 * Canción guardada, con la fecha en que se agregó
 */
export class TrackResponseDto extends TrackDto {
  addedAt?: Date;
}

/**
 * Copia solo los campos conocidos (el body puede traer más)
 */
export const pickTrack = (track: TrackDto) => ({
  trackId: track.trackId,
  title: track.title,
  artistId: track.artistId,
  artistName: track.artistName,
  artistPicture: track.artistPicture || null,
  albumId: track.albumId || null,
  albumTitle: track.albumTitle || null,
  cover: track.cover || null,
  duration: track.duration ?? 0,
  preview: track.preview || null,
  explicit: !!track.explicit,
});

/**
 * Fila de favoritos o de playlist a la forma de respuesta
 */
export const toTrackResponse = (
  row: TrackDto & { createdAt?: Date; addedAt?: Date },
): TrackResponseDto => ({
  trackId: row.trackId,
  title: row.title,
  artistId: row.artistId,
  artistName: row.artistName,
  artistPicture: row.artistPicture ?? undefined,
  albumId: row.albumId ?? undefined,
  albumTitle: row.albumTitle ?? undefined,
  cover: row.cover ?? undefined,
  duration: row.duration ?? 0,
  preview: row.preview ?? undefined,
  explicit: !!row.explicit,
  addedAt: row.addedAt ?? row.createdAt,
});
