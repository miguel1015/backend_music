import { IsEmail, IsString } from 'class-validator';

export class UserLoginDto {
  /**
   * User email
   */
  @IsEmail()
  email: string;

  /**
   * User password
   */
  @IsString()
  password: string;
}
