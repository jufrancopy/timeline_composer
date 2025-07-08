/*
  Warnings:

  - The `mainRole` column on the `Composer` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('COMPOSER', 'POET', 'CONDUCTOR', 'ARRANGER', 'PERFORMER');

-- AlterTable
ALTER TABLE "Composer" DROP COLUMN "mainRole",
ADD COLUMN     "mainRole" "RoleType"[];
