import { ServiceModule } from '@app/services/services.module';
import { Module } from '@nestjs/common';
import { TodoController } from './controllers/todo/todo.controller';
import { AuthController } from './controllers/auth/auth.controller';
import { UserController } from './controllers/user/user.controller';
import { DeezerController } from './controllers/deezer/deezer.controller';
import { LectorPdfController } from './controllers/lectorPdf/lectorPdf.controller';
import { LibraryController } from './controllers/library/library.controller';
import { PlaylistController } from './controllers/library/playlist.controller';

@Module({
  imports: [ServiceModule],
  controllers: [
    TodoController,
    AuthController,
    UserController,
    DeezerController,
    LectorPdfController,
    LibraryController,
    PlaylistController,
  ],
})
export class PresentationModule {}
