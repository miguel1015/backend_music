import { BadRequestException, Injectable } from '@nestjs/common';
// Se importa lib/ directamente: el index de pdf-parse intenta leer un PDF de prueba al cargarse
import pdfParse = require('pdf-parse/lib/pdf-parse.js');

/**
 * Lector PDF services
 */
@Injectable()
export class LectorPdfServices {
  /**
   * Extract the text of a PDF. If a search value is given, only the lines
   * containing it are returned.
   * @param buffer PDF file
   * @param dataValue Text to search
   */
  async read(buffer: Buffer, dataValue?: string): Promise<{ line: string }> {
    let text: string;

    try {
      text = (await pdfParse(buffer)).text;
    } catch {
      throw new BadRequestException('El archivo no es un PDF válido');
    }

    const search = dataValue?.trim().toLowerCase();

    if (!search) {
      return { line: text.trim() };
    }

    const lines = text
      .split('\n')
      .filter((line) => line.toLowerCase().includes(search));

    return {
      line: lines.length
        ? lines.join('\n')
        : `No se encontró "${dataValue}" en el PDF.`,
    };
  }
}
