-- CreateEnum
CREATE TYPE "ClaimType" AS ENUM ('VEHICLE', 'HOME', 'LIABILITY');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'DOCUMENT_REVIEW', 'UNDER_ASSESSMENT', 'ADDITIONAL_INFO_REQUIRED', 'APPROVED', 'REJECTED', 'PAYMENT_PENDING', 'SETTLED');

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "claimNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "assignedHandlerId" TEXT,
    "type" "ClaimType" NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'DRAFT',
    "policyNumber" TEXT NOT NULL,
    "incidentDate" TIMESTAMP(3) NOT NULL,
    "incidentLocation" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimatedDamage" DOUBLE PRECISION,
    "otherPartyInvolved" BOOLEAN NOT NULL DEFAULT false,
    "hasPoliceReport" BOOLEAN NOT NULL DEFAULT false,
    "hasWitnesses" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Claim_claimNumber_key" ON "Claim"("claimNumber");

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_assignedHandlerId_fkey" FOREIGN KEY ("assignedHandlerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
