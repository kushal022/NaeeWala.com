/*
  Warnings:

  - You are about to drop the column `razorpayOrderId` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `razorpayPaymentId` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Barber` table. All the data in the column will be lost.
  - You are about to drop the column `shopName` on the `Barber` table. All the data in the column will be lost.
  - You are about to drop the column `workingHours` on the `Barber` table. All the data in the column will be lost.
  - You are about to drop the column `phoneOrEmail` on the `Otp` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[addressId]` on the table `Barber` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[addressId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `to` to the `Otp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `via` to the `Otp` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('AADHAAR', 'PANCARD', 'GST_CERT', 'SHOP_PHOTO', 'BANK_PROOF', 'OTHER');

-- CreateEnum
CREATE TYPE "OtpVia" AS ENUM ('EMAIL', 'SMS');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'superAdmin';

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "razorpayOrderId",
DROP COLUMN "razorpayPaymentId";

-- AlterTable
ALTER TABLE "Barber" DROP COLUMN "description",
DROP COLUMN "shopName",
DROP COLUMN "workingHours";

-- AlterTable
ALTER TABLE "Otp" DROP COLUMN "phoneOrEmail",
ADD COLUMN     "to" TEXT NOT NULL,
ADD COLUMN     "via" "OtpVia" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "addressId" INTEGER,
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "BarberShop" (
    "id" SERIAL NOT NULL,
    "barberId" INTEGER NOT NULL,
    "addressId" INTEGER,
    "shopName" TEXT NOT NULL,
    "description" TEXT,
    "licenseNo" TEXT,
    "shopType" TEXT,
    "openingTime" TEXT,
    "closingTime" TEXT,
    "photos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BarberShop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BarberBankDetail" (
    "id" SERIAL NOT NULL,
    "barberId" INTEGER NOT NULL,
    "accountHolderName" TEXT,
    "accountNumber" TEXT,
    "ifsc" TEXT,
    "bankName" TEXT,
    "upiId" TEXT,
    "gstNumber" TEXT,
    "aadhaarNumber" TEXT,
    "panNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BarberBankDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BarberDocument" (
    "id" SERIAL NOT NULL,
    "barberId" INTEGER NOT NULL,
    "type" "DocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BarberDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BarberShop_barberId_key" ON "BarberShop"("barberId");

-- CreateIndex
CREATE UNIQUE INDEX "BarberShop_addressId_key" ON "BarberShop"("addressId");

-- CreateIndex
CREATE UNIQUE INDEX "BarberBankDetail_barberId_key" ON "BarberBankDetail"("barberId");

-- CreateIndex
CREATE UNIQUE INDEX "BarberBankDetail_gstNumber_key" ON "BarberBankDetail"("gstNumber");

-- CreateIndex
CREATE UNIQUE INDEX "BarberBankDetail_aadhaarNumber_key" ON "BarberBankDetail"("aadhaarNumber");

-- CreateIndex
CREATE UNIQUE INDEX "BarberBankDetail_panNumber_key" ON "BarberBankDetail"("panNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Barber_addressId_key" ON "Barber"("addressId");

-- CreateIndex
CREATE UNIQUE INDEX "User_addressId_key" ON "User"("addressId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarberShop" ADD CONSTRAINT "BarberShop_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarberShop" ADD CONSTRAINT "BarberShop_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarberBankDetail" ADD CONSTRAINT "BarberBankDetail_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarberDocument" ADD CONSTRAINT "BarberDocument_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
