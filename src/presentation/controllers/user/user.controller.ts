import { JwtAuthGuard, USER_KEY } from '@app/common/guards/jwtAuth.guard';
import { UserServices } from '@app/services/user/user.service';
import { HistoryServices } from '@app/services/history/history.service';
import { UserUpdateDto } from '@app/domain/user/dto/user-update.dto';
import { UserPasswordDto } from '@app/domain/user/dto/user-password.dto';
import { UserDeleteDto } from '@app/domain/user/dto/user-delete.dto';
import { HistoryRequestDto } from '@app/domain/history/dto/history-request.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

/**
 * User controller
 */
@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly userServices: UserServices,
    private readonly historyServices: HistoryServices,
  ) {}

  /**
   * Get the authenticated user
   * @returns
   */
  @Get('me')
  me(@Req() request: Request) {
    return this.userServices.findOne(request[USER_KEY].sub);
  }

  /**
   * Update name and profile image
   * @param updateDto
   * @returns
   */
  @Patch('me')
  update(@Req() request: Request, @Body() updateDto: UserUpdateDto) {
    return this.userServices.update(request[USER_KEY].sub, updateDto);
  }

  /**
   * Change the password
   * @param passwordDto
   * @returns
   */
  @Patch('me/password')
  changePassword(@Req() request: Request, @Body() passwordDto: UserPasswordDto) {
    return this.userServices.changePassword(request[USER_KEY].sub, passwordDto);
  }

  /**
   * Delete the account
   * @param deleteDto
   * @returns
   */
  @Delete('me')
  remove(@Req() request: Request, @Body() deleteDto: UserDeleteDto) {
    return this.userServices.remove(request[USER_KEY].sub, deleteDto.password);
  }

  /**
   * Save a play
   * @param historyDto
   * @returns
   */
  @Post('me/history')
  record(@Req() request: Request, @Body() historyDto: HistoryRequestDto) {
    return this.historyServices.record(request[USER_KEY].sub, historyDto);
  }

  /**
   * Delete the play history
   * @returns
   */
  @Delete('me/history')
  @HttpCode(200)
  clearHistory(@Req() request: Request) {
    return this.historyServices.clear(request[USER_KEY].sub);
  }

  /**
   * Listening stats
   * @param today Day in the user's timezone (YYYY-MM-DD)
   * @returns
   */
  @Get('me/stats')
  @ApiQuery({ name: 'today', required: false, example: '2026-10-15' })
  stats(@Req() request: Request, @Query('today') today?: string) {
    return this.historyServices.stats(request[USER_KEY].sub, today);
  }
}
