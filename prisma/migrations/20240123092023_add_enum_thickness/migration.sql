/*
  Warnings:

  - Changed the type of `Thickness` on the `Book` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Thickness" AS ENUM ('tipis', 'sedang', 'tebal');

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "Thickness",
ADD COLUMN     "Thickness" "Thickness" NOT NULL;
