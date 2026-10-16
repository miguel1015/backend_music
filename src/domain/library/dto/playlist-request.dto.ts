import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { TrackDto } from './track.dto';
import { MAX_PLAYLIST_TRACKS } from './tracks-request.dto';

// Un nombre con solo espacios cuenta como vacío
const trim = ({ value }) => (typeof value === 'string' ? value.trim() : value);

export class PlaylistRequestDto {
  /**
   * Name
   */
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Ponle un nombre a tu playlist' })
  @MaxLength(80, { message: 'El nombre puede tener hasta 80 caracteres' })
  name: string;

  /**
   * Description
   */
  @IsString()
  @IsOptional()
  @MaxLength(300, { message: 'La descripción puede tener hasta 300 caracteres' })
  description?: string;

  /**
   * Anyone with the link can see it
   */
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  /**
   * First tracks (e.g. "Nueva playlist" from a song)
   */
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(MAX_PLAYLIST_TRACKS)
  @ValidateNested({ each: true })
  @Type(() => TrackDto)
  tracks?: TrackDto[];
}

export class PlaylistUpdateDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Ponle un nombre a tu playlist' })
  @MaxLength(80, { message: 'El nombre puede tener hasta 80 caracteres' })
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(300, { message: 'La descripción puede tener hasta 300 caracteres' })
  description?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
