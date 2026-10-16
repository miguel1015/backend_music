import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '@app/infrastructure/persistence/repositories/user/user.repository';
import { HistoryRepository } from '@app/infrastructure/persistence/repositories/history/history.repository';
import { LibraryRepository } from '@app/infrastructure/persistence/repositories/library/library.repository';
import { User } from '@app/domain/user/user.entity';
import { UserResponseDto } from '@app/domain/user/dto/user-response.dto';
import { UserUpdateDto } from '@app/domain/user/dto/user-update.dto';
import { UserPasswordDto } from '@app/domain/user/dto/user-password.dto';

/**
 * User services
 */
@Injectable()
export class UserServices {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _historyRepository: HistoryRepository,
    private readonly _libraryRepository: LibraryRepository,
    @InjectMapper() private readonly _mapper: Mapper,
  ) {}

  /**
   * Get user by id
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.getUser(id);

    return this._mapper.map(user, User, UserResponseDto);
  }

  /**
   * Update name and profile image
   * @param id
   * @param updateDto
   */
  async update(id: number, updateDto: UserUpdateDto): Promise<UserResponseDto> {
    await this.getUser(id);

    const changes: Partial<User> = {};
    if (updateDto.name !== undefined) changes.name = updateDto.name.trim();
    if (updateDto.perfilImage !== undefined) {
      changes.perfilImage = updateDto.perfilImage;
    }

    if (Object.keys(changes).length) {
      await this._userRepository.updateUser(id, changes);
    }

    return this.findOne(id);
  }

  /**
   * Change the password checking the current one
   * @param id
   * @param passwordDto
   */
  async changePassword(id: number, passwordDto: UserPasswordDto) {
    const user = await this.getUser(id);

    if (!(await this.checkPassword(user, passwordDto.currentPassword))) {
      throw new UnauthorizedException('La contraseña actual no es correcta');
    }

    if (passwordDto.currentPassword === passwordDto.newPassword) {
      throw new BadRequestException(
        'La nueva contraseña debe ser distinta de la actual',
      );
    }

    await this._userRepository.updatePassword(
      id,
      await bcrypt.hash(passwordDto.newPassword, 10),
    );

    return { message: 'Contraseña actualizada' };
  }

  /**
   * Delete the account and its history
   * @param id
   * @param password
   */
  async remove(id: number, password: string) {
    const user = await this.getUser(id);

    if (!(await this.checkPassword(user, password))) {
      throw new UnauthorizedException('La contraseña no es correcta');
    }

    await this._historyRepository.clearHistory(id);
    await this._libraryRepository.clearLibrary(id);
    await this._userRepository.deleteUser(user);

    return { message: 'Cuenta eliminada' };
  }

  private async getUser(id: number): Promise<User> {
    const user = await this._userRepository.findUser({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  /**
   * Users from the previous backend may still have it in plain text
   * @param user
   * @param password
   */
  private async checkPassword(user: User, password: string): Promise<boolean> {
    if (/^\$2[aby]\$/.test(user.password)) {
      return bcrypt.compare(password, user.password);
    }

    return user.password === password;
  }
}
