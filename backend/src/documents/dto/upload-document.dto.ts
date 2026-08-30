import { IsEnum, IsUUID } from 'class-validator';
import { DocumentType } from '@prisma/client';

export class UploadDocumentDto {
  @IsUUID()
  claimId!: string;

  @IsEnum(DocumentType)
  type!: DocumentType;
}