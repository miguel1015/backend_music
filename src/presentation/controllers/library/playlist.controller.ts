import { JwtAuthGuard, USER_KEY } from '@app/common/guards/jwtAuth.guard';
import { OptionalJwtAuthGuard } from '@app/common/guards/optionalJwtAuth.guard';
import { TransactionInterceptor } from '@app/common/interceptors/transaction.interceptor';
import { PlaylistServices } from '@app/services/library/playlist.service';
import {
  PlaylistRequestDto,
  PlaylistUpdateDto,
} from '@app/domain/library/dto/playlist-request.dto';
import {
  PlaylistOrderDto,
  TracksRequestDto,
} from '@app/domain/library/dto/tracks-request.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

/**
 * Playlist controller
 */
@Controller('playlists')
@ApiTags('Playlists')
@ApiBearerAuth()
export class PlaylistController {
  constructor(private readonly playlistServices: PlaylistServices) {}

  /**
   * Playlists of the user
   * @returns
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  list(@Req() request: Request) {
    return this.playlistServices.list(request[USER_KEY].sub);
  }

  /**
   * Create a playlist
   * @param playlistDto
   * @returns
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  create(@Req() request: Request, @Body() playlistDto: PlaylistRequestDto) {
    return this.playlistServices.create(request[USER_KEY].sub, playlistDto);
  }

  /**
   * Playlist with its tracks (public ones can be seen without session)
   * @returns
   */
  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  detail(@Req() request: Request, @Param('id', ParseIntPipe) id: number) {
    return this.playlistServices.detail(id, request[USER_KEY]?.sub);
  }

  /**
   * Rename, change the description or the visibility
   * @param updateDto
   * @returns
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: PlaylistUpdateDto,
  ) {
    return this.playlistServices.update(request[USER_KEY].sub, id, updateDto);
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  remove(@Req() request: Request, @Param('id', ParseIntPipe) id: number) {
    return this.playlistServices.remove(request[USER_KEY].sub, id);
  }

  /**
   * Save a copy in the user's library
   * @returns
   */
  @Post(':id/copy')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  copy(@Req() request: Request, @Param('id', ParseIntPipe) id: number) {
    return this.playlistServices.copy(request[USER_KEY].sub, id);
  }

  /**
   * Add tracks (optionally at a position)
   * @param tracksDto
   * @returns
   */
  @Post(':id/tracks')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  addTracks(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() tracksDto: TracksRequestDto,
  ) {
    return this.playlistServices.addTracks(request[USER_KEY].sub, id, tracksDto);
  }

  @Delete(':id/tracks/:trackId')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  removeTrack(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Param('trackId', ParseIntPipe) trackId: number,
  ) {
    return this.playlistServices.removeTrack(request[USER_KEY].sub, id, trackId);
  }

  /**
   * Save a new order
   * @param orderDto Every Deezer id of the playlist in the new order
   * @returns
   */
  @Put(':id/tracks/order')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  reorder(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() orderDto: PlaylistOrderDto,
  ) {
    return this.playlistServices.reorder(request[USER_KEY].sub, id, orderDto);
  }
}
