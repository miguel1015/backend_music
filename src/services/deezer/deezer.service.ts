import { HttpException, Injectable } from '@nestjs/common';

const DEEZER_API_URL = 'https://api.deezer.com';

/**
 * Deezer services
 * @description Proxy a la API pública de Deezer (no permite CORS desde el navegador)
 */
@Injectable()
export class DeezerServices {
  /**
   * Forward a GET request to Deezer
   * @param path Deezer path with query string, e.g. /playlist/123
   */
  async get(path: string): Promise<unknown> {
    let data: any;

    try {
      const response = await fetch(`${DEEZER_API_URL}${path}`);
      data = await response.json();
    } catch (error) {
      throw new HttpException(
        `Error al consultar Deezer: ${error?.message || ''}`,
        502,
      );
    }

    // Deezer responde 200 incluso con error; el error viene en el body
    if (data?.error) {
      throw new HttpException(
        data.error.message || 'Error de Deezer',
        data.error.code === 800 ? 404 : 502,
      );
    }

    return data;
  }
}
