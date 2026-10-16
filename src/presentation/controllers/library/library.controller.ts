import { JwtAuthGuard, USER_KEY } from '@app/common/guards/jwtAuth.guard';
import { LibraryServices } from '@app/services/library/library.service';
import { HistoryServices } from '@app/services/history/history.service';
import { TrackDto } from '@app/domain/library/dto/track.dto';
import { SyncFavoritesDto } from '@app/domain/library/dto/tracks-request.dto';
import {
  FollowedArtistDto,
  SavedAlbumDto,
} from '@app/domain/library/dto/library-request.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

/**
 * Library controller: favorites, saved albums, followed artists and mixes
 */
@Controller('library')
@ApiTags('Library')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class LibraryController {
  constructor(
    private readonly libraryServices: LibraryServices,
    private readonly historyServices: HistoryServices,
  ) {}

  /**
   * Favorites, playlists, albums and artists of the user
   * @returns
   */
  @Get()
  library(@Req() request: Request) {
    return this.libraryServices.library(request[USER_KEY].sub);
  }

  /**
   * Automatic playlists from the play history
   * @param today Day in the user's timezone (YYYY-MM-DD)
   * @returns
   */
  @Get('mixes')
  @ApiQuery({ name: 'today', required: false, example: '2026-10-15' })
  mixes(@Req() request: Request, @Query('today') today?: string) {
    return this.historyServices.mixes(request[USER_KEY].sub, today);
  }

  /**
   * Upload the favorites saved in the browser
   * @param syncDto
   * @returns
   */
  @Put('favorites/sync')
  syncFavorites(@Req() request: Request, @Body() syncDto: SyncFavoritesDto) {
    return this.libraryServices.syncFavorites(
      request[USER_KEY].sub,
      syncDto.tracks,
    );
  }

  @Post('favorites')
  addFavorite(@Req() request: Request, @Body() trackDto: TrackDto) {
    return this.libraryServices.addFavorite(request[USER_KEY].sub, trackDto);
  }

  @Delete('favorites/:trackId')
  @HttpCode(200)
  removeFavorite(
    @Req() request: Request,
    @Param('trackId', ParseIntPipe) trackId: number,
  ) {
    return this.libraryServices.removeFavorite(request[USER_KEY].sub, trackId);
  }

  @Post('albums')
  saveAlbum(@Req() request: Request, @Body() albumDto: SavedAlbumDto) {
    return this.libraryServices.saveAlbum(request[USER_KEY].sub, albumDto);
  }

  @Delete('albums/:albumId')
  @HttpCode(200)
  removeAlbum(
    @Req() request: Request,
    @Param('albumId', ParseIntPipe) albumId: number,
  ) {
    return this.libraryServices.removeAlbum(request[USER_KEY].sub, albumId);
  }

  @Post('artists')
  followArtist(@Req() request: Request, @Body() artistDto: FollowedArtistDto) {
    return this.libraryServices.followArtist(request[USER_KEY].sub, artistDto);
  }

  @Delete('artists/:artistId')
  @HttpCode(200)
  unfollowArtist(
    @Req() request: Request,
    @Param('artistId', ParseIntPipe) artistId: number,
  ) {
    return this.libraryServices.unfollowArtist(request[USER_KEY].sub, artistId);
  }
}
