import { IsString, MinLength } from 'class-validator';

export class UserPasswordDto {
  /**
   * Current password
   */
  @IsString()
  currentPassword: string;

  /**
   * New password
   */
  @IsString()
  @MinLength(6)
  newPassword: string;
}
