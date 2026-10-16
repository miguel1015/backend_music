import { TrackResponseDto } from './track.dto';

export class PlaylistSummaryDto {
  id: number;
  name: string;
  description?: string;
  isPublic: boolean;
  trackCount: number;
  /**
   * Seconds
   */
  duration: number;
  /**
   * Up to 4 distinct covers for the mosaic
   */
  covers: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class PlaylistDetailDto extends PlaylistSummaryDto {
  /**
   * The user asking is the owner (can edit)
   */
  isOwner: boolean;
  owner: { id: number; name: string; perfilImage?: string };
  tracks: TrackResponseDto[];
}

export class SavedAlbumResponseDto {
  albumId: number;
  title: string;
  cover?: string;
  artistId: number;
  artistName: string;
  recordType?: string;
  releaseDate?: string;
  savedAt: Date;
}

export class FollowedArtistResponseDto {
  artistId: number;
  name: string;
  picture?: string;
  followedAt: Date;
}

export class LibraryResponseDto {
  favorites: TrackResponseDto[];
  playlists: PlaylistSummaryDto[];
  albums: SavedAlbumResponseDto[];
  artists: FollowedArtistResponseDto[];
}

export class MixTrackDto {
  id: number;
  title: string;
  artistId: number;
  artistName: string;
  cover?: string;
  preview?: string;
  plays: number;
}

export class MixDto {
  /**
   * top | recent | rediscover
   */
  id: string;
  tracks: MixTrackDto[];
}
