import { Column, ValueTransformer } from 'typeorm';

/**
 * Los IDs de Deezer superan el rango de int: se guardan como bigint y
 * Postgres los devuelve como texto
 */
export const bigintToNumber: ValueTransformer = {
  to: (value?: number) => value,
  from: (value?: string | null) => (value == null ? value : Number(value)),
};

/**
 * Datos de una canción de Deezer que se guardan junto a favoritos y playlists
 * para poder mostrarlas sin volver a consultar Deezer
 */
export abstract class TrackColumns {
  /**
   * Deezer track id
   */
  @Column({ type: 'bigint', transformer: bigintToNumber })
  trackId: number;

  /**
   * Track title
   */
  @Column({ length: 255 })
  title: string;

  /**
   * Deezer artist id
   */
  @Column({ type: 'bigint', transformer: bigintToNumber })
  artistId: number;

  /**
   * Artist name
   */
  @Column({ length: 255 })
  artistName: string;

  /**
   * Artist picture url
   */
  @Column({ type: 'text', nullable: true })
  artistPicture?: string;

  /**
   * Deezer album id
   */
  @Column({ type: 'bigint', nullable: true, transformer: bigintToNumber })
  albumId?: number;

  /**
   * Album title
   */
  @Column({ length: 255, nullable: true })
  albumTitle?: string;

  /**
   * Album cover url
   */
  @Column({ type: 'text', nullable: true })
  cover?: string;

  /**
   * Duration in seconds
   */
  @Column({ type: 'int', default: 0 })
  duration: number;

  /**
   * Preview url (Deezer renews it, the player asks again when it expires)
   */
  @Column({ type: 'text', nullable: true })
  preview?: string;

  /**
   * Explicit lyrics
   */
  @Column({ default: false })
  explicit: boolean;
}
