import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlaylistRepository } from '@app/infrastructure/persistence/repositories/library/playlist.repository';
import { UserRepository } from '@app/infrastructure/persistence/repositories/user/user.repository';
import { Playlist } from '@app/domain/library/playlist.entity';
import {
  PlaylistRequestDto,
  PlaylistUpdateDto,
} from '@app/domain/library/dto/playlist-request.dto';
import {
  MAX_PLAYLIST_TRACKS,
  PlaylistOrderDto,
  TracksRequestDto,
} from '@app/domain/library/dto/tracks-request.dto';
import {
  TrackDto,
  pickTrack,
  toTrackResponse,
} from '@app/domain/library/dto/track.dto';
import {
  PlaylistDetailDto,
  PlaylistSummaryDto,
} from '@app/domain/library/dto/library-response.dto';

export const MAX_PLAYLISTS = 100;

/**
 * Sin repetir canciones y sin las que ya están en la playlist
 */
const newTracks = (tracks: TrackDto[], existing: Iterable<number>) => {
  const seen = new Set(existing);
  return tracks.filter((track) => {
    if (seen.has(track.trackId)) return false;
    seen.add(track.trackId);
    return true;
  });
};

/**
 * Playlist services
 */
@Injectable()
export class PlaylistServices {
  constructor(
    private readonly _playlistRepository: PlaylistRepository,
    private readonly _userRepository: UserRepository,
  ) {}

  /**
   * Playlists of the user
   * @param userId
   */
  async list(userId: number): Promise<PlaylistSummaryDto[]> {
    const playlists = await this._playlistRepository.getPlaylists(userId);
    const stats = await this._playlistRepository.getStats(
      playlists.map((playlist) => playlist.id),
    );

    return playlists.map((playlist) =>
      this.toSummary(playlist, stats.get(playlist.id)),
    );
  }

  /**
   * Create a playlist (optionally with its first tracks)
   * @param userId
   * @param playlistDto
   */
  async create(
    userId: number,
    playlistDto: PlaylistRequestDto,
  ): Promise<PlaylistSummaryDto> {
    const total = await this._playlistRepository.countPlaylists(userId);
    if (total >= MAX_PLAYLISTS) {
      throw new BadRequestException(
        `Puedes tener hasta ${MAX_PLAYLISTS} playlists. Borra alguna para crear otra.`,
      );
    }

    const playlist = await this._playlistRepository.createPlaylist({
      userId,
      name: playlistDto.name.trim(),
      description: playlistDto.description?.trim() || null,
      isPublic: !!playlistDto.isPublic,
    });

    const tracks = newTracks(playlistDto.tracks ?? [], []);
    await this._playlistRepository.insertTracks(
      playlist.id,
      tracks.map(pickTrack),
      0,
    );

    return this.summary(playlist);
  }

  /**
   * Playlist with its tracks. Private playlists are only visible to the owner
   * @param id
   * @param viewerId Authenticated user (if any)
   */
  async detail(id: number, viewerId?: number): Promise<PlaylistDetailDto> {
    const playlist = await this.getVisible(id, viewerId);
    const [tracks, owner, summary] = await Promise.all([
      this._playlistRepository.getTracks(id),
      this._userRepository.findUser({ where: { id: playlist.userId } }),
      this.summary(playlist),
    ]);

    return {
      ...summary,
      isOwner: playlist.userId === viewerId,
      owner: {
        id: playlist.userId,
        name: owner?.name ?? 'Usuario de MusikMike',
        perfilImage: owner?.perfilImage || undefined,
      },
      tracks: tracks.map(toTrackResponse),
    };
  }

  /**
   * Rename, change the description or the visibility
   */
  async update(
    userId: number,
    id: number,
    updateDto: PlaylistUpdateDto,
  ): Promise<PlaylistSummaryDto> {
    const playlist = await this.getOwned(id, userId);
    const changes: Partial<Playlist> = {};

    if (updateDto.name !== undefined) changes.name = updateDto.name.trim();
    if (updateDto.description !== undefined) {
      changes.description = updateDto.description.trim() || null;
    }
    if (updateDto.isPublic !== undefined) changes.isPublic = updateDto.isPublic;

    if (Object.keys(changes).length) {
      await this._playlistRepository.updatePlaylist(id, changes);
    }

    return this.summary({ ...playlist, ...changes, updatedAt: new Date() });
  }

  async remove(userId: number, id: number) {
    await this.getOwned(id, userId);
    await this._playlistRepository.deletePlaylist(id);

    return { deleted: true };
  }

  /**
   * Add tracks (the ones already in the playlist are skipped)
   */
  async addTracks(userId: number, id: number, tracksDto: TracksRequestDto) {
    const playlist = await this.getOwned(id, userId);
    const existing = await this._playlistRepository.getTrackIds(id);
    const tracks = newTracks(tracksDto.tracks, existing);
    const skipped = tracksDto.tracks.length - tracks.length;

    if (existing.length + tracks.length > MAX_PLAYLIST_TRACKS) {
      throw new BadRequestException(
        `Una playlist puede tener hasta ${MAX_PLAYLIST_TRACKS} canciones.`,
      );
    }

    const position = Math.min(
      Math.max(tracksDto.position ?? existing.length, 0),
      existing.length,
    );
    await this._playlistRepository.insertTracks(
      id,
      tracks.map(pickTrack),
      position,
    );
    if (tracks.length) await this._playlistRepository.touch(id);

    return {
      added: tracks.length,
      skipped,
      playlist: await this.summary(playlist),
    };
  }

  async removeTrack(userId: number, id: number, trackId: number) {
    const playlist = await this.getOwned(id, userId);
    const position = await this._playlistRepository.removeTrack(id, trackId);

    if (position === null) {
      throw new NotFoundException('La canción ya no está en la playlist');
    }
    await this._playlistRepository.touch(id);

    return { position, playlist: await this.summary(playlist) };
  }

  /**
   * Save the order chosen by the user
   */
  async reorder(userId: number, id: number, orderDto: PlaylistOrderDto) {
    const playlist = await this.getOwned(id, userId);
    const existing = await this._playlistRepository.getTrackIds(id);
    const current = new Set(existing);
    const sameTracks =
      orderDto.trackIds.length === existing.length &&
      new Set(orderDto.trackIds).size === existing.length &&
      orderDto.trackIds.every((trackId) => current.has(trackId));

    if (!sameTracks) {
      throw new BadRequestException(
        'La playlist cambió mientras la ordenabas. Recarga e inténtalo de nuevo.',
      );
    }

    await this._playlistRepository.reorder(id, orderDto.trackIds);
    await this._playlistRepository.touch(id);

    return this.summary(playlist);
  }

  /**
   * Save a copy of a playlist (own or public) in the user's library
   */
  async copy(userId: number, id: number): Promise<PlaylistSummaryDto> {
    const source = await this.getVisible(id, userId);
    const tracks = await this._playlistRepository.getTracks(id);

    return this.create(userId, {
      name: `${source.name}`.slice(0, 80),
      description: source.description ?? undefined,
      isPublic: false,
      tracks: tracks.map((track) => ({
        ...toTrackResponse(track),
        addedAt: undefined,
      })),
    });
  }

  /*
  Utilidades
  */

  private async getVisible(id: number, viewerId?: number): Promise<Playlist> {
    const playlist = await this._playlistRepository.getPlaylist(id);

    // Una playlist privada de otro usuario se trata como inexistente
    if (!playlist || (!playlist.isPublic && playlist.userId !== viewerId)) {
      throw new NotFoundException('No encontramos esta playlist');
    }

    return playlist;
  }

  private async getOwned(id: number, userId: number): Promise<Playlist> {
    const playlist = await this.getVisible(id, userId);

    if (playlist.userId !== userId) {
      throw new ForbiddenException('Solo el creador puede cambiar esta playlist');
    }

    return playlist;
  }

  private async summary(playlist: Playlist): Promise<PlaylistSummaryDto> {
    const stats = await this._playlistRepository.getStats([playlist.id]);
    return this.toSummary(playlist, stats.get(playlist.id));
  }

  private toSummary(
    playlist: Playlist,
    stats = { trackCount: 0, duration: 0, covers: [] as string[] },
  ): PlaylistSummaryDto {
    return {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description ?? undefined,
      isPublic: playlist.isPublic,
      trackCount: stats.trackCount,
      duration: stats.duration,
      covers: stats.covers,
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt,
    };
  }
}
