import { Test } from '@nestjs/testing';
import { ClaimsService } from './claims.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('ClaimsService', () => {
  let service: ClaimsService;
  let prisma: {
    claim: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    auditLogEntry: {
      create: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      claim: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      auditLogEntry: {
        create: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [ClaimsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(ClaimsService);
  });

  it('throws NotFoundException if the claim does not exist', async () => {
    prisma.claim.findUnique.mockResolvedValue(null);

    await expect(service.transitionStatus('fake-id', 'SUBMITTED', 'user-1', 'CUSTOMER')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws ForbiddenException if a different handler tries to act on an assigned claim', async () => {
    prisma.claim.findUnique.mockResolvedValue({
      id: 'claim-1',
      status: 'SUBMITTED',
      assignedHandlerId: 'handler-A',
    });

    await expect(
      service.transitionStatus('claim-1', 'DOCUMENT_REVIEW', 'handler-B', 'CLAIMS_HANDLER'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('allows the assigned handler to transition the claim, and writes an audit log', async () => {
    prisma.claim.findUnique.mockResolvedValue({
      id: 'claim-1',
      status: 'SUBMITTED',
      assignedHandlerId: 'handler-A',
    });
    prisma.$transaction.mockResolvedValue([{ id: 'claim-1', status: 'DOCUMENT_REVIEW' }]);

    const result = await service.transitionStatus('claim-1', 'DOCUMENT_REVIEW', 'handler-A', 'CLAIMS_HANDLER');

    expect(result.status).toBe('DOCUMENT_REVIEW');
    expect(prisma.$transaction).toHaveBeenCalled();
  });
});