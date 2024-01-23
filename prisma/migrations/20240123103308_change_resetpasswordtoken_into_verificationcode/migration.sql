/*
  Warnings:

  - You are about to drop the column `ResetPasswordToken` on the `UserAuth` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[VerificationCode]` on the table `UserAuth` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UserAuth_ResetPasswordToken_key";

-- AlterTable
ALTER TABLE "UserAuth" DROP COLUMN "ResetPasswordToken",
ADD COLUMN     "VerificationCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_VerificationCode_key" ON "UserAuth"("VerificationCode");
