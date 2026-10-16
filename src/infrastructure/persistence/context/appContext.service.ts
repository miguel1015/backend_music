import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Request } from 'express';
import { AbstractRepository } from '@app/common/classes/abstractRepository';
import { GenericRepository } from '@app/common/classes/genericRepository';
import { Todo } from '@app/domain/todo/todo.entity';
import { User } from '@app/domain/user/user.entity';
import { PlayHistory } from '@app/domain/history/play-history.entity';
import { FavoriteTrack } from '@app/domain/library/favorite-track.entity';
import { Playlist } from '@app/domain/library/playlist.entity';
import { PlaylistTrack } from '@app/domain/library/playlist-track.entity';
import { SavedAlbum } from '@app/domain/library/saved-album.entity';
import { FollowedArtist } from '@app/domain/library/followed-artist.entity';

/**
 * App context
 * @description App context
 */
@Injectable()
export class AppContext {
  /**
   * Todo repository
   */
  todo: AbstractRepository<Todo>;

  /**
   * User repository
   */
  user: AbstractRepository<User>;

  /**
   * Play history repository
   */
  playHistory: AbstractRepository<PlayHistory>;

  /**
   * Favorite tracks repository
   */
  favoriteTrack: AbstractRepository<FavoriteTrack>;

  /**
   * Playlist repository
   */
  playlist: AbstractRepository<Playlist>;

  /**
   * Playlist tracks repository
   */
  playlistTrack: AbstractRepository<PlaylistTrack>;

  /**
   * Saved albums repository
   */
  savedAlbum: AbstractRepository<SavedAlbum>;

  /**
   * Followed artists repository
   */
  followedArtist: AbstractRepository<FollowedArtist>;

  constructor(
    private dataSource: DataSource,
    @Inject('REQUEST') private request: Request,
  ) {
    this.todo = new GenericRepository(Todo, dataSource, request);
    this.user = new GenericRepository(User, dataSource, request);
    this.playHistory = new GenericRepository(PlayHistory, dataSource, request);
    this.favoriteTrack = new GenericRepository(FavoriteTrack, dataSource, request);
    this.playlist = new GenericRepository(Playlist, dataSource, request);
    this.playlistTrack = new GenericRepository(PlaylistTrack, dataSource, request);
    this.savedAlbum = new GenericRepository(SavedAlbum, dataSource, request);
    this.followedArtist = new GenericRepository(
      FollowedArtist,
      dataSource,
      request,
    );
  }
}
