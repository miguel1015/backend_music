import { DeezerServices } from '@app/services/deezer/deezer.service';
import { Controller, Get, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

/**
 * Deezer controller
 */
@Controller('deezer')
@ApiTags('Deezer')
export class DeezerController {
  constructor(private readonly deezerServices: DeezerServices) {}

  /**
   * Proxy any GET to Deezer, e.g. /api/deezer/playlist/123
   * @returns
   */
  @Get('*')
  proxy(@Req() request: Request) {
    const path = request.originalUrl.replace(/^\/api\/deezer/, '');
    return this.deezerServices.get(path);
  }
}
