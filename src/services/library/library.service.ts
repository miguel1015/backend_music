import { Injectable } from '@nestjs/common';
import { LibraryRepository } from '@app/infrastructure/persistence/repositories/library/library.repository';
import {
  TrackDto,
  pickTrack,
  toTrackResponse,
} from '@app/domain/library/dto/track.dto';
import {
  FollowedArtistDto,
  SavedAlbumDto,
} from '@app/domain/library/dto/library-request.dto';
import { LibraryResponseDto } from '@app/domain/library/dto/library-response.dto';
import { SavedAlbum } from '@app/domain/library/saved-album.entity';
import { FollowedArtist } from '@app/domain/library/followed-artist.entity';
import { PlaylistServices } from './playlist.service';

/**
 * Library services: favorites, saved albums and followed artists
 */
@Injectable()
export class LibraryServices {
  constructor(
    private readonly _libraryRepository: LibraryRepository,
    private readonly _playlistServices: PlaylistServices,
  ) {}

  /**
   * Everything the user saved, in one request
   * @param userId
   */
  async library(userId: number): Promise<LibraryResponseDto> {
    const [favorites, playlists, albums, artists] = await Promise.all([
      this.favorites(userId),
      this._playlistServices.list(userId),
      this._libraryRepository.getAlbums(userId),
      this._libraryRepository.getArtists(userId),
    ]);

    return {
      favorites,
      playlists,
      albums: albums.map(this.toAlbum),
      artists: artists.map(this.toArtist),
    };
  }

  async favorites(userId: number) {
    const rows = await this._libraryRepository.getFavorites(userId);
    return rows.map(toTrackResponse);
  }

  /**
   * Upload the favorites saved in the browser and return the merged list
   * @param userId
   * @param tracks
   */
  async syncFavorites(userId: number, tracks: TrackDto[]) {
    // El más reciente va primero en el navegador: se insertan al revés para
    // que conserven ese orden por fecha
    const rows = [...tracks]
      .reverse()
      .map((track) => ({ ...pickTrack(track), userId }));
    const added = await this._libraryRepository.addFavorites(rows);

    return { added, favorites: await this.favorites(userId) };
  }

  async addFavorite(userId: number, track: TrackDto) {
    await this._libraryRepository.addFavorites([{ ...pickTrack(track), userId }]);
    return { saved: true };
  }

  async removeFavorite(userId: number, trackId: number) {
    const removed = await this._libraryRepository.removeFavorite(userId, trackId);
    return { removed: removed > 0 };
  }

  async saveAlbum(userId: number, albumDto: SavedAlbumDto) {
    await this._libraryRepository.saveAlbum({
      userId,
      albumId: albumDto.albumId,
      title: albumDto.title,
      cover: albumDto.cover || null,
      artistId: albumDto.artistId,
      artistName: albumDto.artistName,
      recordType: albumDto.recordType || null,
      releaseDate: albumDto.releaseDate || null,
    });
    return { saved: true };
  }

  async removeAlbum(userId: number, albumId: number) {
    const removed = await this._libraryRepository.removeAlbum(userId, albumId);
    return { removed: removed > 0 };
  }

  async followArtist(userId: number, artistDto: FollowedArtistDto) {
    await this._libraryRepository.followArtist({
      userId,
      artistId: artistDto.artistId,
      name: artistDto.name,
      picture: artistDto.picture || null,
    });
    return { following: true };
  }

  async unfollowArtist(userId: number, artistId: number) {
    const removed = await this._libraryRepository.unfollowArtist(userId, artistId);
    return { removed: removed > 0 };
  }

  private toAlbum = (album: SavedAlbum) => ({
    albumId: album.albumId,
    title: album.title,
    cover: album.cover ?? undefined,
    artistId: album.artistId,
    artistName: album.artistName,
    recordType: album.recordType ?? undefined,
    releaseDate: album.releaseDate ?? undefined,
    savedAt: album.createdAt,
  });

  private toArtist = (artist: FollowedArtist) => ({
    artistId: artist.artistId,
    name: artist.name,
    picture: artist.picture ?? undefined,
    followedAt: artist.createdAt,
  });
}
