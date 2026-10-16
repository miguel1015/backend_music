import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, forMember, mapFrom, type Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { User } from '@app/domain/user/user.entity';
import { UserResponseDto } from '@app/domain/user/dto/user-response.dto';
import { UserRegisterDto } from '@app/domain/user/dto/user-register.dto';

const TRIAL_DAYS = 30;

/**
 * User profile
 */
@Injectable()
export class UserProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  /**
   * Profile
   * @param mapper
   */
  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        User,
        UserResponseDto,
        forMember(
          (destination) => destination.createdAt,
          mapFrom((source) => source.createdAt),
        ),
        // Sin fecha guardada, la prueba dura 30 días desde el registro
        forMember(
          (destination) => destination.trialEndsAt,
          mapFrom(
            (source) =>
              source.trialEndsAt ??
              (source.createdAt
                ? new Date(
                    new Date(source.createdAt).getTime() +
                      TRIAL_DAYS * 24 * 60 * 60 * 1000,
                  )
                : undefined),
          ),
        ),
      );
      createMap(mapper, UserRegisterDto, User);
    };
  }
}
