import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class SavedAlbumDto {
  /**
   * Deezer album id
   */
  @IsInt()
  @Min(1)
  albumId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  cover?: string;

  @IsInt()
  @Min(1)
  artistId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  artistName: string;

  @IsIn(['album', 'single', 'ep', 'compile'])
  @IsOptional()
  recordType?: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsOptional()
  releaseDate?: string;
}

export class FollowedArtistDto {
  /**
   * Deezer artist id
   */
  @IsInt()
  @Min(1)
  artistId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  picture?: string;
}
