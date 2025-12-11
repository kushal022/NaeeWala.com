/*
  Warnings:

  - You are about to drop the `BarberBankDetail` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BarberBankDetail" DROP CONSTRAINT "BarberBankDetail_barberId_fkey";

-- DropTable
DROP TABLE "BarberBankDetail";

-- CreateTable
CREATE TABLE "Bank" (
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

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bank_barberId_key" ON "Bank"("barberId");

-- CreateIndex
CREATE UNIQUE INDEX "Bank_gstNumber_key" ON "Bank"("gstNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Bank_aadhaarNumber_key" ON "Bank"("aadhaarNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Bank_panNumber_key" ON "Bank"("panNumber");

-- AddForeignKey
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
