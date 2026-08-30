import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { canTransition } from './claim-transitions';
import { ClaimStatus } from '@prisma/client';

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

  async transitionStatus(
    claimId: string,
    toStatus: ClaimStatus,
    actorUserId: string,
    actorRole: 'CUSTOMER' | 'CLAIMS_HANDLER',
  ) {
    const claim = await this.prisma.claim.findUnique({ where: { id: claimId }});
    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    if (actorRole === 'CLAIMS_HANDLER' && claim.assignedHandlerId && claim.assignedHandlerId !== actorUserId) {
      throw new ForbiddenException('This claim is assigned to a different handler');
    }
    
    const isAllowed = canTransition(claim.status, toStatus, actorRole);
    if (!isAllowed) {
      throw new ForbiddenException(
        `Cannot transition claim from ${claim.status} to ${toStatus} as ${actorRole}`,
      );
    }
    const [updatedClaim] = await this.prisma.$transaction([
      this.prisma.claim.update({
        where: {id: claimId},
        data: {status: toStatus},
      }),
      this.prisma.auditLogEntry.create({
        data: {
          claimId,
          actorUserId,
          action: 'STATUS_CHANGE',
          fromValue: claim.status,
          toValue: toStatus,
        },
      }),
    ]);
    
    return updatedClaim;
  }

  async assignToHandler(claimId: string, handlerId: string) {
    const claim = await this.prisma.claim.findUnique({ where: { id: claimId } });
    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    if (claim.assignedHandlerId) {
      throw new BadRequestException('Claim is already assigned to a handler');
    }

    const [updatedClaim] = await this.prisma.$transaction([
      this.prisma.claim.update({
        where: { id: claimId },
        data: { assignedHandlerId: handlerId },
      }),
      this.prisma.auditLogEntry.create({
        data: {
          claimId,
          actorUserId: handlerId,
          action: 'ASSIGNED',
          fromValue: null,
          toValue: handlerId,
        },
      }),
    ]);

    return updatedClaim;
  }
}
