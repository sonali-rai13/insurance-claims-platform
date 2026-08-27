import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClaimDto } from './dto/create-claim.dto';

@Injectable()
export class ClaimsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateClaimDto, customerId: string) {
    // TEMPORARY: hardcoded customer until auth is built.
    // This MUST be replaced with the authenticated user's id.
    //const TEMP_CUSTOMER_ID = '14226f96-3c0b-49b6-9642-28d5e73b3f80';

    const claimNumber = `CLM-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    return this.prisma.claim.create({
      data: {
        ...dto,
        incidentDate: new Date(dto.incidentDate),
        claimNumber,
        customerId,
        status: 'DRAFT',
      },
    });
  }

  async findAll() {
    return this.prisma.claim.findMany();
  }
}
