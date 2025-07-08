-- CreateEnum
CREATE TYPE "Period" AS ENUM ('COLONIAL', 'INDEPENDENCIA', 'POSGUERRA', 'GUARANIA', 'DICTADURA', 'TRANSICION', 'ACTUALIDAD');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MUSICIAN', 'POET', 'BOTH');

-- CreateTable
CREATE TABLE "Composer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "deathDate" TIMESTAMP(3),
    "period" "Period",
    "ipAddress" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "photoUrl" TEXT,
    "youtubeLink" TEXT,
    "mainRole" "Role" NOT NULL DEFAULT 'MUSICIAN',

    CONSTRAINT "Composer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "composerId" INTEGER NOT NULL,
    "author" TEXT,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_composerId_fkey" FOREIGN KEY ("composerId") REFERENCES "Composer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
