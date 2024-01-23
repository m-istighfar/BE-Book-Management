-- CreateTable
CREATE TABLE "Category" (
    "CategoryID" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("CategoryID")
);

-- CreateTable
CREATE TABLE "Book" (
    "BookID" SERIAL NOT NULL,
    "Title" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "ImageUrl" TEXT NOT NULL,
    "ReleaseYear" INTEGER NOT NULL,
    "Price" TEXT NOT NULL,
    "TotalPage" INTEGER NOT NULL,
    "Thickness" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "CategoryID" INTEGER NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("BookID")
);

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_CategoryID_fkey" FOREIGN KEY ("CategoryID") REFERENCES "Category"("CategoryID") ON DELETE RESTRICT ON UPDATE CASCADE;
