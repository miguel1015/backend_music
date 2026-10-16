import { AutoMap } from '@automapper/classes';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UserRegisterDto {
  /**
   * User name
   */
  @IsString()
  @IsNotEmpty()
  @AutoMap()
  name: string;

  /**
   * User email
   */
  @IsEmail()
  @AutoMap()
  email: string;

  /**
   * User password
   */
  @IsString()
  @MinLength(6)
  password: string;

  /**
   * Profile image in base64
   */
  @IsString()
  @IsNotEmpty()
  @AutoMap()
  perfilImage: string;
}
