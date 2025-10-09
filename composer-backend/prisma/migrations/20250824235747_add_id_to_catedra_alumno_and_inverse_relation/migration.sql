/*
  Warnings:

  - The primary key for the `CatedraAlumno` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[catedraId,alumnoId]` on the table `CatedraAlumno` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[catedraId,composerId]` on the table `CatedraAlumno` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "CatedraAlumno" DROP CONSTRAINT "CatedraAlumno_alumnoId_fkey";

-- AlterTable
ALTER TABLE "CatedraAlumno" DROP CONSTRAINT "CatedraAlumno_pkey",
ADD COLUMN     "composerId" INTEGER,
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "alumnoId" DROP NOT NULL,
ADD CONSTRAINT "CatedraAlumno_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "CatedraAlumno_catedraId_alumnoId_key" ON "CatedraAlumno"("catedraId", "alumnoId");

-- CreateIndex
CREATE UNIQUE INDEX "CatedraAlumno_catedraId_composerId_key" ON "CatedraAlumno"("catedraId", "composerId");

-- AddForeignKey
ALTER TABLE "CatedraAlumno" ADD CONSTRAINT "CatedraAlumno_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatedraAlumno" ADD CONSTRAINT "CatedraAlumno_composerId_fkey" FOREIGN KEY ("composerId") REFERENCES "Composer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
