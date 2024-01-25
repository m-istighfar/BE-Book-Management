-- DropForeignKey
ALTER TABLE "Book" DROP CONSTRAINT "Book_CategoryID_fkey";

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_CategoryID_fkey" FOREIGN KEY ("CategoryID") REFERENCES "Category"("CategoryID") ON DELETE CASCADE ON UPDATE CASCADE;
