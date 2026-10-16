import { IsString } from 'class-validator';

export class UserDeleteDto {
  /**
   * Current password, to confirm the deletion
   */
  @IsString()
  password: string;
}
