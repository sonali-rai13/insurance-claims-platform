import { IsString, IsEnum, IsDateString, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import { ClaimType } from '@prisma/client';

export class CreateClaimDto {
  @IsEnum(ClaimType)
  type: ClaimType;

  @IsString()
  policyNumber: string;

  @IsDateString()
  incidentDate: string;

  @IsString()
  incidentLocation: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  estimatedDamage?: number;

  @IsOptional()
  @IsBoolean()
  otherPartyInvolved?: boolean;

  @IsOptional()
  @IsBoolean()
  hasPoliceReport?: boolean;

  @IsOptional()
  @IsBoolean()
  hasWitnesses?: boolean;
}