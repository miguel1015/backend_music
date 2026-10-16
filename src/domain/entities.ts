import { Todo } from './todo/todo.entity';
import { User } from './user/user.entity';
import { PlayHistory } from './history/play-history.entity';
import { FavoriteTrack } from './library/favorite-track.entity';
import { Playlist } from './library/playlist.entity';
import { PlaylistTrack } from './library/playlist-track.entity';
import { SavedAlbum } from './library/saved-album.entity';
import { FollowedArtist } from './library/followed-artist.entity';

export const ENTITIES = [
  Todo,
  User,
  PlayHistory,
  FavoriteTrack,
  Playlist,
  PlaylistTrack,
  SavedAlbum,
  FollowedArtist,
];
