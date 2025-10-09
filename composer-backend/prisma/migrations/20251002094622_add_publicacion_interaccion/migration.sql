-- CreateEnum
CREATE TYPE "public"."TipoInteraccionPublicacion" AS ENUM ('ME_GUSTA');

-- CreateTable
CREATE TABLE "public"."PublicacionInteraccion" (
    "id" SERIAL NOT NULL,
    "publicacionId" INTEGER NOT NULL,
    "alumnoId" INTEGER,
    "docenteId" INTEGER,
    "tipo" "public"."TipoInteraccionPublicacion" NOT NULL DEFAULT 'ME_GUSTA',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublicacionInteraccion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PublicacionInteraccion_publicacionId_alumnoId_key" ON "public"."PublicacionInteraccion"("publicacionId", "alumnoId");

-- CreateIndex
CREATE UNIQUE INDEX "PublicacionInteraccion_publicacionId_docenteId_key" ON "public"."PublicacionInteraccion"("publicacionId", "docenteId");

-- AddForeignKey
ALTER TABLE "public"."PublicacionInteraccion" ADD CONSTRAINT "PublicacionInteraccion_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES "public"."Publicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PublicacionInteraccion" ADD CONSTRAINT "PublicacionInteraccion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "public"."Alumno"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PublicacionInteraccion" ADD CONSTRAINT "PublicacionInteraccion_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "public"."Docente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
