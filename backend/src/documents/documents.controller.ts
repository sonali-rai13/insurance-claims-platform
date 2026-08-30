import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import type { UploadedFileData } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: UploadedFileData,
    @Body() dto: UploadDocumentDto,
    @CurrentUser() user: { userId: string; email: string; role: 'CUSTOMER' | 'CLAIMS_HANDLER' },
  ) {
    return this.documentsService.uploadDocument(dto.claimId, dto.type, file, user.userId, user.role);
  }
}