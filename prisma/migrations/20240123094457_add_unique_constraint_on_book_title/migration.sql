/*
  Warnings:

  - A unique constraint covering the columns `[Title]` on the table `Book` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Book_Title_key" ON "Book"("Title");
