import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

export interface UploadedFileData {
  originalname: string;
  buffer: Buffer;
}

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async uploadDocument(
    claimId: string,
    type: DocumentType,
    file: UploadedFileData,
    uploadedByUserId: string,
    uploaderRole: 'CUSTOMER' | 'CLAIMS_HANDLER',
  ) {
    const claim = await this.prisma.claim.findUnique({ where: { id: claimId } });
    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    // Ownership check — BEFORE any file is written
    const isOwner = claim.customerId === uploadedByUserId;
    const isAssignedHandler = claim.assignedHandlerId === uploadedByUserId;
    if (uploaderRole === 'CUSTOMER' && !isOwner) {
      throw new ForbiddenException('You can only upload documents to your own claims');
    }
    if (uploaderRole === 'CLAIMS_HANDLER' && !isAssignedHandler) {
      throw new ForbiddenException('You can only upload documents to claims assigned to you');
    }

    // Only now do we touch the filesystem
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const uniqueFilename = `${Date.now()}-${file.originalname}`;
    const storagePath = path.join(UPLOAD_DIR, uniqueFilename);
    fs.writeFileSync(storagePath, file.buffer);

    return this.prisma.document.create({
      data: {
        claimId,
        uploadedById: uploadedByUserId,
        type,
        filename: file.originalname,
        storageUrl: storagePath,
        status: 'UPLOADED',
      },
    });
  }
}
