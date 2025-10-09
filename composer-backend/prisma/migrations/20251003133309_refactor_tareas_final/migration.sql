/*
  Warnings:

  - You are about to drop the `Tarea` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[tareaMaestraId]` on the table `Publicacion` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Tarea" DROP CONSTRAINT "Tarea_alumnoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Tarea" DROP CONSTRAINT "Tarea_catedraId_fkey";

-- AlterTable
ALTER TABLE "public"."Publicacion" ADD COLUMN     "tareaMaestraId" INTEGER;

-- DropTable
DROP TABLE "public"."Tarea";

-- CreateTable
CREATE TABLE "public"."TareaMaestra" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha_entrega" TIMESTAMP(3),
    "puntos_posibles" INTEGER NOT NULL,
    "recursos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "multimedia_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "catedraId" INTEGER NOT NULL,
    "publicacionId" INTEGER,

    CONSTRAINT "TareaMaestra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TareaAsignacion" (
    "id" SERIAL NOT NULL,
    "estado" "public"."EstadoTarea" NOT NULL DEFAULT 'ASIGNADA',
    "submission_path" TEXT,
    "submission_date" TIMESTAMP(3),
    "puntos_obtenidos" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "alumnoId" INTEGER NOT NULL,
    "tareaMaestraId" INTEGER NOT NULL,

    CONSTRAINT "TareaAsignacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TareaMaestra_publicacionId_key" ON "public"."TareaMaestra"("publicacionId");

-- CreateIndex
CREATE UNIQUE INDEX "TareaAsignacion_alumnoId_tareaMaestraId_key" ON "public"."TareaAsignacion"("alumnoId", "tareaMaestraId");

-- CreateIndex
CREATE UNIQUE INDEX "Publicacion_tareaMaestraId_key" ON "public"."Publicacion"("tareaMaestraId");

-- AddForeignKey
ALTER TABLE "public"."TareaMaestra" ADD CONSTRAINT "TareaMaestra_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES "public"."Catedra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TareaAsignacion" ADD CONSTRAINT "TareaAsignacion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "public"."Alumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TareaAsignacion" ADD CONSTRAINT "TareaAsignacion_tareaMaestraId_fkey" FOREIGN KEY ("tareaMaestraId") REFERENCES "public"."TareaMaestra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Publicacion" ADD CONSTRAINT "Publicacion_tareaMaestraId_fkey" FOREIGN KEY ("tareaMaestraId") REFERENCES "public"."TareaMaestra"("id") ON DELETE SET NULL ON UPDATE CASCADE;
