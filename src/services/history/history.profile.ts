import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, type Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { PlayHistory } from '@app/domain/history/play-history.entity';
import { HistoryRequestDto } from '@app/domain/history/dto/history-request.dto';

/**
 * History profile
 */
@Injectable()
export class HistoryProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  /**
   * Profile
   * @param mapper
   */
  override get profile() {
    return (mapper) => {
      createMap(mapper, HistoryRequestDto, PlayHistory);
    };
  }
}
