import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { TrackDto } from './track.dto';

export const MAX_PLAYLIST_TRACKS = 500;

/**
 * Varias canciones a la vez (agregar a una playlist, sincronizar favoritos)
 */
export class TracksRequestDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_PLAYLIST_TRACKS)
  @ValidateNested({ each: true })
  @Type(() => TrackDto)
  tracks: TrackDto[];

  /**
   * Where to insert them (end of the list when omitted)
   */
  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number;
}

/**
 * Favoritos guardados en el navegador antes de iniciar sesión
 */
export class SyncFavoritesDto {
  @IsArray()
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => TrackDto)
  tracks: TrackDto[];
}

/**
 * Nuevo orden de una playlist
 */
export class PlaylistOrderDto {
  @IsArray()
  @ArrayMaxSize(MAX_PLAYLIST_TRACKS)
  @IsInt({ each: true })
  trackIds: number[];
}
