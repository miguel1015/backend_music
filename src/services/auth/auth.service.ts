import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '@app/infrastructure/persistence/repositories/user/user.repository';
import { User } from '@app/domain/user/user.entity';
import { UserRegisterDto } from '@app/domain/user/dto/user-register.dto';
import { UserLoginDto } from '@app/domain/user/dto/user-login.dto';
import { UserResponseDto } from '@app/domain/user/dto/user-response.dto';
import { AuthResponseDto } from '@app/domain/user/dto/auth-response.dto';

/**
 * Auth services
 */
@Injectable()
export class AuthServices {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _jwtService: JwtService,
    @InjectMapper() private readonly _mapper: Mapper,
  ) {}

  /**
   * Register a new user
   * @param registerDto
   */
  async register(registerDto: UserRegisterDto): Promise<AuthResponseDto> {
    const email = registerDto.email.toLowerCase();
    const exist = await this._userRepository.findUser({ where: { email } });

    if (exist) {
      throw new ConflictException('El email ya se encuentra registrado');
    }

    const userPayload = this._mapper.map(registerDto, UserRegisterDto, User);
    userPayload.email = email;
    userPayload.password = await bcrypt.hash(registerDto.password, 10);

    const user = await this._userRepository.createUser(userPayload);

    return this.buildAuthResponse(user);
  }

  /**
   * Login with email and password
   * @param loginDto
   */
  async login(loginDto: UserLoginDto): Promise<AuthResponseDto> {
    const user = await this._userRepository.findUser({
      where: { email: loginDto.email.toLowerCase() },
    });

    if (!user || !(await this.checkPassword(user, loginDto.password))) {
      throw new UnauthorizedException('Usuario o contraseña incorrecta');
    }

    return this.buildAuthResponse(user);
  }

  /**
   * Compare the password. Users from the previous backend have it in plain
   * text: if it matches, it is migrated to bcrypt.
   * @param user
   * @param password
   */
  private async checkPassword(user: User, password: string): Promise<boolean> {
    if (/^\$2[aby]\$/.test(user.password)) {
      return bcrypt.compare(password, user.password);
    }

    if (user.password !== password) {
      return false;
    }

    await this._userRepository.updatePassword(
      user.id,
      await bcrypt.hash(password, 10),
    );

    return true;
  }

  /**
   * Sign the token and map the user
   * @param user
   */
  private async buildAuthResponse(user: User): Promise<AuthResponseDto> {
    const token = await this._jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      token,
      user: this._mapper.map(user, User, UserResponseDto),
    };
  }
}
