-- CreateTable
CREATE TABLE "UserAuth" (
    "UserAuthID" SERIAL NOT NULL,
    "Username" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "ResetPasswordToken" TEXT,
    "ResetPasswordExpires" TIMESTAMP(3),
    "Verified" BOOLEAN NOT NULL DEFAULT false,
    "VerificationToken" TEXT,
    "UserID" INTEGER,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAuth_pkey" PRIMARY KEY ("UserAuthID")
);

-- CreateTable
CREATE TABLE "User" (
    "UserID" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Phone" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("UserID")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_Username_key" ON "UserAuth"("Username");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_Email_key" ON "UserAuth"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_ResetPasswordToken_key" ON "UserAuth"("ResetPasswordToken");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_VerificationToken_key" ON "UserAuth"("VerificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_UserID_key" ON "UserAuth"("UserID");

-- AddForeignKey
ALTER TABLE "UserAuth" ADD CONSTRAINT "UserAuth_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "User"("UserID") ON DELETE SET NULL ON UPDATE CASCADE;
