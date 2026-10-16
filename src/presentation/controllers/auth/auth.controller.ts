import { UserRegisterDto } from '@app/domain/user/dto/user-register.dto';
import { UserLoginDto } from '@app/domain/user/dto/user-login.dto';
import { AuthServices } from '@app/services/auth/auth.service';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

/**
 * Auth controller
 */
@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authServices: AuthServices) {}

  /**
   * Register a new user
   * @param registerDto
   * @returns
   */
  @Post('register')
  register(@Body() registerDto: UserRegisterDto) {
    return this.authServices.register(registerDto);
  }

  /**
   * Login
   * @param loginDto
   * @returns
   */
  @Post('login')
  @HttpCode(200)
  login(@Body() loginDto: UserLoginDto) {
    return this.authServices.login(loginDto);
  }
}
