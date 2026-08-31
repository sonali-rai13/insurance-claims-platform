import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('claims')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClaimsController {
  constructor(private claimsService: ClaimsService) {}

  @Post()
  @Roles('CUSTOMER')
  create(@Body() dto: CreateClaimDto, @CurrentUser() user: { userId: string; email: string; role: string }) {
    return this.claimsService.create(dto, user.userId);
  }

  @Get()
  findAll(@CurrentUser() user: { userId: string; email: string; role: 'CUSTOMER' | 'CLAIMS_HANDLER' }) {
    return this.claimsService.findAll(user.userId, user.role);
  }

  @Patch(':id/status')
  transitionStatus(
    @Param('id') id: string,
    @Body('status') status: 'DRAFT' | 'SUBMITTED' | 'DOCUMENT_REVIEW' | 'UNDER_ASSESSMENT' | 'ADDITIONAL_INFO_REQUIRED' | 'APPROVED' | 'REJECTED' | 'PAYMENT_PENDING' | 'SETTLED',
    @CurrentUser() user: { userId: string; email: string; role: 'CUSTOMER' | 'CLAIMS_HANDLER' },
  ) {
    return this.claimsService.transitionStatus(id, status, user.userId, user.role);
  }

  @Patch(':id/assign')
  @Roles('CLAIMS_HANDLER')
  assignToHandler(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; email: string; role: 'CUSTOMER' | 'CLAIMS_HANDLER' },
  ) {
    return this.claimsService.assignToHandler(id, user.userId);
  }
}