import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
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
  findAll() {
    return this.claimsService.findAll();
  }
}