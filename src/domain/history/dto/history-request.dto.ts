import { AutoMap } from '@automapper/classes';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class HistoryRequestDto {
  /**
   * Deezer track id
   */
  @IsInt()
  @Min(1)
  @AutoMap()
  trackId: number;

  /**
   * Track title
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @AutoMap()
  title: string;

  /**
   * Deezer artist id
   */
  @IsInt()
  @Min(1)
  @AutoMap()
  artistId: number;

  /**
   * Artist name
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @AutoMap()
  artistName: string;

  /**
   * Artist picture url
   */
  @IsString()
  @IsOptional()
  @AutoMap()
  artistPicture?: string;

  /**
   * Album cover url
   */
  @IsString()
  @IsOptional()
  @AutoMap()
  cover?: string;

  /**
   * Preview url
   */
  @IsString()
  @IsOptional()
  @AutoMap()
  preview?: string;

  /**
   * Seconds listened
   */
  @IsInt()
  @Min(1)
  @Max(3600)
  @AutoMap()
  seconds: number;

  /**
   * Day in the user's timezone (YYYY-MM-DD)
   */
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @AutoMap()
  localDate: string;

  /**
   * Hour in the user's timezone (0-23)
   */
  @IsInt()
  @Min(0)
  @Max(23)
  @AutoMap()
  localHour: number;
}
