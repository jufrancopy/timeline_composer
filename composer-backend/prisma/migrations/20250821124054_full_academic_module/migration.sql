-- CreateEnum
CREATE TYPE "EstadoTarea" AS ENUM ('ASIGNADA', 'ENTREGADA', 'CALIFICADA', 'VENCIDA');

-- CreateTable
CREATE TABLE "Catedra" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "institucion" TEXT NOT NULL,
    "turno" TEXT NOT NULL,
    "horario" TEXT NOT NULL,
    "aula" TEXT NOT NULL,
    "dias" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Catedra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alumno" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "direccion" TEXT,
    "instrumento" TEXT,
    "detalles_adicionales" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alumno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatedraAlumno" (
    "catedraId" INTEGER NOT NULL,
    "alumnoId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,

    CONSTRAINT "CatedraAlumno_pkey" PRIMARY KEY ("catedraId","alumnoId")
);

-- CreateTable
CREATE TABLE "Tarea" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha_entrega" TIMESTAMP(3),
    "puntos_posibles" INTEGER NOT NULL,
    "estado" "EstadoTarea" NOT NULL DEFAULT 'ASIGNADA',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "catedraId" INTEGER NOT NULL,
    "alumnoId" INTEGER NOT NULL,

    CONSTRAINT "Tarea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Puntuacion" (
    "id" SERIAL NOT NULL,
    "puntos" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alumnoId" INTEGER NOT NULL,

    CONSTRAINT "Puntuacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluacion" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "catedraId" INTEGER NOT NULL,

    CONSTRAINT "Evaluacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pregunta" (
    "id" SERIAL NOT NULL,
    "texto" TEXT NOT NULL,
    "evaluacionId" INTEGER NOT NULL,

    CONSTRAINT "Pregunta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opcion" (
    "id" SERIAL NOT NULL,
    "texto" TEXT NOT NULL,
    "es_correcta" BOOLEAN NOT NULL DEFAULT false,
    "preguntaId" INTEGER NOT NULL,

    CONSTRAINT "Opcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RespuestaAlumno" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alumnoId" INTEGER NOT NULL,
    "preguntaId" INTEGER NOT NULL,
    "opcionElegidaId" INTEGER NOT NULL,

    CONSTRAINT "RespuestaAlumno_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Alumno_email_key" ON "Alumno"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RespuestaAlumno_alumnoId_preguntaId_key" ON "RespuestaAlumno"("alumnoId", "preguntaId");

-- AddForeignKey
ALTER TABLE "CatedraAlumno" ADD CONSTRAINT "CatedraAlumno_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES "Catedra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatedraAlumno" ADD CONSTRAINT "CatedraAlumno_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarea" ADD CONSTRAINT "Tarea_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES "Catedra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarea" ADD CONSTRAINT "Tarea_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Puntuacion" ADD CONSTRAINT "Puntuacion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluacion" ADD CONSTRAINT "Evaluacion_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES "Catedra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pregunta" ADD CONSTRAINT "Pregunta_evaluacionId_fkey" FOREIGN KEY ("evaluacionId") REFERENCES "Evaluacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opcion" ADD CONSTRAINT "Opcion_preguntaId_fkey" FOREIGN KEY ("preguntaId") REFERENCES "Pregunta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespuestaAlumno" ADD CONSTRAINT "RespuestaAlumno_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespuestaAlumno" ADD CONSTRAINT "RespuestaAlumno_preguntaId_fkey" FOREIGN KEY ("preguntaId") REFERENCES "Pregunta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespuestaAlumno" ADD CONSTRAINT "RespuestaAlumno_opcionElegidaId_fkey" FOREIGN KEY ("opcionElegidaId") REFERENCES "Opcion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
