import { TodoRepository } from './todo/todo.repository';
import { UserRepository } from './user/user.repository';
import { HistoryRepository } from './history/history.repository';
import { LibraryRepository } from './library/library.repository';
import { PlaylistRepository } from './library/playlist.repository';

export const REPOSITORIES = [
  TodoRepository,
  UserRepository,
  HistoryRepository,
  LibraryRepository,
  PlaylistRepository,
];
