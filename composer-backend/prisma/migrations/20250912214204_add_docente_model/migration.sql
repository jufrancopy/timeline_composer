-- AlterTable
ALTER TABLE "Catedra" ADD COLUMN     "docenteId" INTEGER;

-- CreateTable
CREATE TABLE "Docente" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otpSecret" TEXT,
    "otpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Docente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Docente_email_key" ON "Docente"("email");

-- AddForeignKey
ALTER TABLE "Catedra" ADD CONSTRAINT "Catedra_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "Docente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
