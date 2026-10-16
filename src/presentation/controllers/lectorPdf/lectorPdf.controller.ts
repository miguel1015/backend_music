import { LectorPdfServices } from '@app/services/lectorPdf/lectorPdf.service';
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

/**
 * Lector PDF controller
 */
@Controller('lectorPdf')
@ApiTags('Lector PDF')
export class LectorPdfController {
  constructor(private readonly lectorPdfServices: LectorPdfServices) {}

  /**
   * Upload a PDF and extract its text
   * @returns
   */
  @Post('upload')
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor('pdf', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  upload(
    @UploadedFile() pdf: Express.Multer.File,
    @Body('dataValue') dataValue?: string,
  ) {
    if (!pdf) {
      throw new BadRequestException('Debe enviar un archivo PDF');
    }

    return this.lectorPdfServices.read(pdf.buffer, dataValue);
  }
}
