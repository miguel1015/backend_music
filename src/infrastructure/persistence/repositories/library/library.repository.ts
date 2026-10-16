import { HttpException, Injectable, Scope } from '@nestjs/common';
import { FavoriteTrack } from '@app/domain/library/favorite-track.entity';
import { SavedAlbum } from '@app/domain/library/saved-album.entity';
import { FollowedArtist } from '@app/domain/library/followed-artist.entity';
import { AppContext } from '../../context/appContext.service';

/**
 * Favoritos, álbumes guardados y artistas seguidos
 */
@Injectable({ scope: Scope.REQUEST })
export class LibraryRepository {
  constructor(private readonly _context: AppContext) {}

  private fail(error): never {
    throw new HttpException(
      `Error de DB: ${error?.message || ''}`,
      error?.status || 500,
    );
  }

  /*
  Favoritos
  */

  /**
   * Favorite tracks, newest first
   * @param userId User id
   */
  async getFavorites(userId: number): Promise<FavoriteTrack[]> {
    try {
      return await this._context.favoriteTrack.getAll({
        where: { userId },
        order: { createdAt: 'DESC', id: 'DESC' },
      });
    } catch (error) {
      this.fail(error);
    }
  }

  /**
   * Save tracks as favorites (the ones already saved are ignored)
   * @param rows Favorites
   * @returns How many were added
   */
  async addFavorites(rows: Partial<FavoriteTrack>[]): Promise<number> {
    if (!rows.length) return 0;
    try {
      const result = await this._context.favoriteTrack
        .getTypeOrmRepository()
        .createQueryBuilder()
        .insert()
        .into(FavoriteTrack)
        .values(rows)
        .orIgnore()
        .execute();
      return result.identifiers.filter(Boolean).length;
    } catch (error) {
      this.fail(error);
    }
  }

  /**
   * @param userId User id
   * @param trackId Deezer track id
   */
  async removeFavorite(userId: number, trackId: number): Promise<number> {
    try {
      const result = await this._context.favoriteTrack
        .getTypeOrmRepository()
        .delete({ userId, trackId });
      return result.affected ?? 0;
    } catch (error) {
      this.fail(error);
    }
  }

  /*
  Álbumes
  */

  async getAlbums(userId: number): Promise<SavedAlbum[]> {
    try {
      return await this._context.savedAlbum.getAll({
        where: { userId },
        order: { createdAt: 'DESC', id: 'DESC' },
      });
    } catch (error) {
      this.fail(error);
    }
  }

  async saveAlbum(album: Partial<SavedAlbum>): Promise<void> {
    try {
      await this._context.savedAlbum
        .getTypeOrmRepository()
        .createQueryBuilder()
        .insert()
        .into(SavedAlbum)
        .values(album)
        .orIgnore()
        .execute();
    } catch (error) {
      this.fail(error);
    }
  }

  async removeAlbum(userId: number, albumId: number): Promise<number> {
    try {
      const result = await this._context.savedAlbum
        .getTypeOrmRepository()
        .delete({ userId, albumId });
      return result.affected ?? 0;
    } catch (error) {
      this.fail(error);
    }
  }

  /*
  Artistas
  */

  async getArtists(userId: number): Promise<FollowedArtist[]> {
    try {
      return await this._context.followedArtist.getAll({
        where: { userId },
        order: { createdAt: 'DESC', id: 'DESC' },
      });
    } catch (error) {
      this.fail(error);
    }
  }

  async followArtist(artist: Partial<FollowedArtist>): Promise<void> {
    try {
      await this._context.followedArtist
        .getTypeOrmRepository()
        .createQueryBuilder()
        .insert()
        .into(FollowedArtist)
        .values(artist)
        .orIgnore()
        .execute();
    } catch (error) {
      this.fail(error);
    }
  }

  async unfollowArtist(userId: number, artistId: number): Promise<number> {
    try {
      const result = await this._context.followedArtist
        .getTypeOrmRepository()
        .delete({ userId, artistId });
      return result.affected ?? 0;
    } catch (error) {
      this.fail(error);
    }
  }

  /**
   * Delete everything the user saved (account deletion)
   * @param userId User id
   */
  async clearLibrary(userId: number): Promise<void> {
    try {
      await Promise.all([
        this._context.favoriteTrack.getTypeOrmRepository().delete({ userId }),
        this._context.savedAlbum.getTypeOrmRepository().delete({ userId }),
        this._context.followedArtist.getTypeOrmRepository().delete({ userId }),
        // Las canciones de cada playlist se borran en cascada
        this._context.playlist.getTypeOrmRepository().delete({ userId }),
      ]);
    } catch (error) {
      this.fail(error);
    }
  }
}
