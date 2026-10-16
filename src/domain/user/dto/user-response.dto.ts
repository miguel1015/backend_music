import { AutoMap } from '@automapper/classes';

export class UserResponseDto {
  /**
   * User id
   */
  @AutoMap()
  id: number;

  /**
   * User name
   */
  @AutoMap()
  name: string;

  /**
   * User email
   */
  @AutoMap()
  email: string;

  /**
   * Profile image in base64
   */
  @AutoMap()
  perfilImage?: string;

  /**
   * Subscription plan: trial | premium | family
   */
  @AutoMap()
  plan: string;

  /**
   * End of the free trial
   */
  trialEndsAt?: Date;

  /**
   * Member since
   */
  createdAt?: Date;
}
