import { UserResponseDto } from './user-response.dto';

export class AuthResponseDto {
  /**
   * JWT access token
   */
  token: string;

  /**
   * Authenticated user
   */
  user: UserResponseDto;
}
