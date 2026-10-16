import { AutoMap } from '@automapper/classes';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class UserUpdateDto {
  /**
   * User name
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  @IsOptional()
  @AutoMap()
  name?: string;

  /**
   * Profile image in base64
   */
  @IsString()
  @Matches(/^data:image\/(png|jpe?g|webp|gif);base64,/, {
    message: 'La foto debe ser una imagen en base64',
  })
  @IsOptional()
  @AutoMap()
  perfilImage?: string;
}
