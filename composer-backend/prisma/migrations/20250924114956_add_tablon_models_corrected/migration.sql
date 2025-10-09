-- CreateEnum
CREATE TYPE "TipoPublicacion" AS ENUM ('ANUNCIO', 'TAREA', 'EVALUACION', 'OTRO');

-- CreateTable
CREATE TABLE "Publicacion" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "tipo" "TipoPublicacion" NOT NULL,
    "catedraId" INTEGER NOT NULL,
    "autorAlumnoId" INTEGER,
    "autorDocenteId" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Publicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComentarioPublicacion" (
    "id" SERIAL NOT NULL,
    "texto" TEXT NOT NULL,
    "publicacionId" INTEGER NOT NULL,
    "autorAlumnoId" INTEGER,
    "autorDocenteId" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComentarioPublicacion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Publicacion" ADD CONSTRAINT "Publicacion_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES "Catedra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publicacion" ADD CONSTRAINT "Publicacion_autorAlumnoId_fkey" FOREIGN KEY ("autorAlumnoId") REFERENCES "Alumno"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publicacion" ADD CONSTRAINT "Publicacion_autorDocenteId_fkey" FOREIGN KEY ("autorDocenteId") REFERENCES "Docente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComentarioPublicacion" ADD CONSTRAINT "ComentarioPublicacion_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES "Publicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComentarioPublicacion" ADD CONSTRAINT "ComentarioPublicacion_autorAlumnoId_fkey" FOREIGN KEY ("autorAlumnoId") REFERENCES "Alumno"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComentarioPublicacion" ADD CONSTRAINT "ComentarioPublicacion_autorDocenteId_fkey" FOREIGN KEY ("autorDocenteId") REFERENCES "Docente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
