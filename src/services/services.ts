import { TodoServices } from './todo/todo.service';
import { UserServices } from './user/user.service';
import { AuthServices } from './auth/auth.service';
import { DeezerServices } from './deezer/deezer.service';
import { LectorPdfServices } from './lectorPdf/lectorPdf.service';
import { HistoryServices } from './history/history.service';
import { LibraryServices } from './library/library.service';
import { PlaylistServices } from './library/playlist.service';

export const SERVICES = [
  TodoServices,
  UserServices,
  AuthServices,
  DeezerServices,
  LectorPdfServices,
  HistoryServices,
  LibraryServices,
  PlaylistServices,
];
