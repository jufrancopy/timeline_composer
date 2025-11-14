-- CreateEnum
CREATE TYPE "EstadoEvaluacionAsignacion" AS ENUM ('PENDIENTE', 'REALIZADA', 'CALIFICADA', 'VENCIDA');

-- CreateEnum
CREATE TYPE "EstadoTarea" AS ENUM ('ASIGNADA', 'ENTREGADA', 'CALIFICADA', 'VENCIDA');

-- CreateEnum
CREATE TYPE "ModalidadPago" AS ENUM ('PARTICULAR', 'INSTITUCIONAL');

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('COMPOSER', 'POET', 'CONDUCTOR', 'ARRANGER', 'PERFORMER', 'STUDENT', 'ENSEMBLE_ORCHESTRA');

-- CreateEnum
CREATE TYPE "TipoInteraccionPublicacion" AS ENUM ('ME_GUSTA');

-- CreateEnum
CREATE TYPE "TipoOrganizacionPlan" AS ENUM ('MES', 'MODULO');

-- CreateEnum
CREATE TYPE "TipoPago" AS ENUM ('MATRICULA', 'CUOTA', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoPublicacion" AS ENUM ('ANUNCIO', 'TAREA', 'EVALUACION', 'OTRO', 'TAREA_ASIGNADA');

-- CreateEnum
CREATE TYPE "TipoPuntuacion" AS ENUM ('TAREA', 'EVALUACION', 'APORTE');

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
    "nombre_tutor" TEXT,
    "telefono_tutor" TEXT,
    "vive_con_padres" BOOLEAN DEFAULT false,

    CONSTRAINT "Alumno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asistencia" (
    "id" SERIAL NOT NULL,
    "presente" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alumnoId" INTEGER NOT NULL,
    "diaClaseId" INTEGER NOT NULL,

    CONSTRAINT "Asistencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalificacionEvaluacion" (
    "id" SERIAL NOT NULL,
    "puntos" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alumnoId" INTEGER NOT NULL,
    "evaluacionAsignacionId" INTEGER NOT NULL,

    CONSTRAINT "CalificacionEvaluacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Catedra" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "institucion" TEXT NOT NULL,
    "turno" TEXT NOT NULL,
    "aula" TEXT NOT NULL,
    "dias" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "docenteId" INTEGER,
    "modalidad_pago" "ModalidadPago" NOT NULL DEFAULT 'PARTICULAR',

    CONSTRAINT "Catedra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatedraAlumno" (
    "catedraId" INTEGER NOT NULL,
    "alumnoId" INTEGER,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,
    "composerId" INTEGER,
    "id" SERIAL NOT NULL,
    "dia_cobro" INTEGER,
    "fecha_inscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatedraAlumno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatedraDiaHorario" (
    "id" SERIAL NOT NULL,
    "dia_semana" TEXT NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT NOT NULL,
    "catedraId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatedraDiaHorario_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "composerId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "name" TEXT NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Composer" (
    "id" SERIAL NOT NULL,
    "bio" TEXT NOT NULL,
    "birth_day" INTEGER,
    "birth_month" INTEGER,
    "birth_year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "death_day" INTEGER,
    "death_month" INTEGER,
    "death_year" INTEGER,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "ip_address" TEXT,
    "last_name" TEXT NOT NULL,
    "notable_works" TEXT NOT NULL,
    "photo_url" TEXT,
    "quality" TEXT,
    "references" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "youtube_link" TEXT,
    "period" TEXT NOT NULL,
    "mainRole" "RoleType"[],
    "completeness_score" INTEGER,
    "rejection_reason" TEXT,
    "is_student_contribution" BOOLEAN NOT NULL DEFAULT false,
    "student_first_name" TEXT,
    "student_last_name" TEXT,
    "suggestion_reason" TEXT,

    CONSTRAINT "Composer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostoCatedra" (
    "id" SERIAL NOT NULL,
    "catedraId" INTEGER NOT NULL,
    "monto_matricula" DOUBLE PRECISION,
    "monto_cuota" DOUBLE PRECISION,
    "es_gratuita" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostoCatedra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiaClase" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "dia_semana" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "catedraId" INTEGER NOT NULL,

    CONSTRAINT "DiaClase_pkey" PRIMARY KEY ("id")
);

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
    "direccion" TEXT,
    "telefono" TEXT,

    CONSTRAINT "Docente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditSuggestion" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "birth_year" INTEGER,
    "birth_month" INTEGER,
    "birth_day" INTEGER,
    "death_year" INTEGER,
    "death_month" INTEGER,
    "death_day" INTEGER,
    "bio" TEXT,
    "notable_works" TEXT,
    "period" TEXT,
    "references" TEXT,
    "youtube_link" TEXT,
    "mainRole" "RoleType"[],
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "suggester_email" TEXT NOT NULL,
    "suggester_ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "composerId" INTEGER NOT NULL,
    "is_student_contribution" BOOLEAN DEFAULT false,
    "student_first_name" TEXT,
    "student_last_name" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "photo_url" TEXT,

    CONSTRAINT "EditSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluacion" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "catedraId" INTEGER NOT NULL,
    "fecha_limite" TIMESTAMP(3),
    "isMaster" BOOLEAN NOT NULL DEFAULT true,
    "unidadPlanId" INTEGER,

    CONSTRAINT "Evaluacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluacionAsignacion" (
    "id" SERIAL NOT NULL,
    "estado" "EstadoEvaluacionAsignacion" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_entrega" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "alumnoId" INTEGER NOT NULL,
    "evaluacionId" INTEGER NOT NULL,
    "publicacionId" INTEGER,

    CONSTRAINT "EvaluacionAsignacion_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Otp" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" SERIAL NOT NULL,
    "catedraAlumnoId" INTEGER NOT NULL,
    "fecha_pago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto_pagado" DOUBLE PRECISION NOT NULL,
    "tipo_pago" "TipoPago" NOT NULL,
    "periodo_cubierto" TEXT,
    "confirmadoPorId" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanDeClases" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipoOrganizacion" "TipoOrganizacionPlan" NOT NULL,
    "docenteId" INTEGER NOT NULL,
    "catedraId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanDeClases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pregunta" (
    "id" SERIAL NOT NULL,
    "texto" TEXT NOT NULL,
    "evaluacionId" INTEGER NOT NULL,

    CONSTRAINT "Pregunta_pkey" PRIMARY KEY ("id")
);

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
    "tareaMaestraId" INTEGER,
    "visibleToStudents" BOOLEAN NOT NULL DEFAULT false,
    "evaluacionAsignacionId" INTEGER,
    "evaluacionMaestraId" INTEGER,

    CONSTRAINT "Publicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicacionInteraccion" (
    "id" SERIAL NOT NULL,
    "publicacionId" INTEGER NOT NULL,
    "alumnoId" INTEGER,
    "docenteId" INTEGER,
    "tipo" "TipoInteraccionPublicacion" NOT NULL DEFAULT 'ME_GUSTA',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublicacionInteraccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Puntuacion" (
    "id" SERIAL NOT NULL,
    "puntos" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alumnoId" INTEGER NOT NULL,
    "catedraId" INTEGER,
    "tipo" "TipoPuntuacion" NOT NULL,

    CONSTRAINT "Puntuacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" SERIAL NOT NULL,
    "rating_value" INTEGER NOT NULL,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "composerId" INTEGER NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "TareaAsignacion" (
    "id" SERIAL NOT NULL,
    "estado" "EstadoTarea" NOT NULL DEFAULT 'ASIGNADA',
    "submission_date" TIMESTAMP(3),
    "puntos_obtenidos" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "alumnoId" INTEGER NOT NULL,
    "tareaMaestraId" INTEGER NOT NULL,
    "comentario_docente" TEXT,
    "submission_path" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "TareaAsignacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TareaMaestra" (
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
    "unidadPlanId" INTEGER,

    CONSTRAINT "TareaMaestra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnidadPlan" (
    "id" SERIAL NOT NULL,
    "planDeClasesId" INTEGER NOT NULL,
    "periodo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "capacidades" TEXT NOT NULL,
    "horasTeoricas" INTEGER NOT NULL,
    "horasPracticas" INTEGER NOT NULL,
    "estrategiasMetodologicas" TEXT NOT NULL,
    "mediosVerificacionEvaluacion" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "recursos" JSONB[] DEFAULT ARRAY[]::JSONB[],

    CONSTRAINT "UnidadPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Alumno_email_key" ON "Alumno"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Asistencia_alumnoId_diaClaseId_key" ON "Asistencia"("alumnoId" ASC, "diaClaseId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "CalificacionEvaluacion_alumnoId_evaluacionAsignacionId_key" ON "CalificacionEvaluacion"("alumnoId" ASC, "evaluacionAsignacionId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "CalificacionEvaluacion_evaluacionAsignacionId_key" ON "CalificacionEvaluacion"("evaluacionAsignacionId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "CatedraAlumno_catedraId_alumnoId_key" ON "CatedraAlumno"("catedraId" ASC, "alumnoId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "CatedraAlumno_catedraId_composerId_key" ON "CatedraAlumno"("catedraId" ASC, "composerId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "CostoCatedra_catedraId_key" ON "CostoCatedra"("catedraId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Docente_email_key" ON "Docente"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "EvaluacionAsignacion_alumnoId_evaluacionId_key" ON "EvaluacionAsignacion"("alumnoId" ASC, "evaluacionId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "EvaluacionAsignacion_publicacionId_key" ON "EvaluacionAsignacion"("publicacionId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Otp_email_key" ON "Otp"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Pago_catedraAlumnoId_tipo_pago_periodo_cubierto_key" ON "Pago"("catedraAlumnoId" ASC, "tipo_pago" ASC, "periodo_cubierto" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Publicacion_evaluacionAsignacionId_key" ON "Publicacion"("evaluacionAsignacionId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Publicacion_evaluacionMaestraId_key" ON "Publicacion"("evaluacionMaestraId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Publicacion_tareaMaestraId_key" ON "Publicacion"("tareaMaestraId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "PublicacionInteraccion_publicacionId_alumnoId_key" ON "PublicacionInteraccion"("publicacionId" ASC, "alumnoId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "PublicacionInteraccion_publicacionId_docenteId_key" ON "PublicacionInteraccion"("publicacionId" ASC, "docenteId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Rating_composerId_ip_address_key" ON "Rating"("composerId" ASC, "ip_address" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "RespuestaAlumno_alumnoId_preguntaId_key" ON "RespuestaAlumno"("alumnoId" ASC, "preguntaId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "TareaAsignacion_alumnoId_tareaMaestraId_key" ON "TareaAsignacion"("alumnoId" ASC, "tareaMaestraId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "TareaMaestra_publicacionId_key" ON "TareaMaestra"("publicacionId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username" ASC);

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_diaClaseId_fkey" FOREIGN KEY ("diaClaseId") REFERENCES "DiaClase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalificacionEvaluacion" ADD CONSTRAINT "CalificacionEvaluacion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CalificacionEvaluacion" ADD CONSTRAINT "CalificacionEvaluacion_evaluacionAsignacionId_fkey" FOREIGN KEY ("evaluacionAsignacionId") REFERENCES "EvaluacionAsignacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Catedra" ADD CONSTRAINT "Catedra_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "Docente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatedraAlumno" ADD CONSTRAINT "CatedraAlumno_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CatedraAlumno" ADD CONSTRAINT "CatedraAlumno_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES "Catedra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatedraAlumno" ADD CONSTRAINT "CatedraAlumno_composerId_fkey" FOREIGN KEY ("composerId") REFERENCES "Composer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatedraDiaHorario" ADD CONSTRAINT "CatedraDiaHorario_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES "Catedra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComentarioPublicacion" ADD CONSTRAINT "ComentarioPublicacion_autorAlumnoId_fkey" FOREIGN KEY ("autorAlumnoId") REFERENCES "Alumno"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ComentarioPublicacion" ADD CONSTRAINT "ComentarioPublicacion_autorDocenteId_fkey" FOREIGN KEY ("autorDocenteId") REFERENCES "Docente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComentarioPublicacion" ADD CONSTRAINT "ComentarioPublicacion_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES "Publicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_composerId_fkey" FOREIGN KEY ("composerId") REFERENCES "Composer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostoCatedra" ADD CONSTRAINT "CostoCatedra_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES "Catedra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaClase" ADD CONSTRAINT "DiaClase_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES "Catedra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditSuggestion" ADD CONSTRAINT "EditSuggestion_composerId_fkey" FOREIGN KEY ("composerId") REFERENCES "Composer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluacion" ADD CONSTRAINT "Evaluacion_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES "Catedra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluacion" ADD CONSTRAINT "Evaluacion_unidadPlanId_fkey" FOREIGN KEY ("unidadPlanId") REFERENCES "UnidadPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionAsignacion" ADD CONSTRAINT "EvaluacionAsignacion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "EvaluacionAsignacion" ADD CONSTRAINT "EvaluacionAsignacion_evaluacionId_fkey" FOREIGN KEY ("evaluacionId") REFERENCES "Evaluacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opcion" ADD CONSTRAINT "Opcion_preguntaId_fkey" FOREIGN KEY ("preguntaId") REFERENCES "Pregunta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_catedraAlumnoId_fkey" FOREIGN KEY ("catedraAlumnoId") REFERENCES "CatedraAlumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_confirmadoPorId_fkey" FOREIGN KEY ("confirmadoPorId") REFERENCES "Docente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanDeClases" ADD CONSTRAINT "PlanDeClases_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES "Catedra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanDeClases" ADD CONSTRAINT "PlanDeClases_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "Docente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pregunta" ADD CONSTRAINT "Pregunta_evaluacionId_fkey" FOREIGN KEY ("evaluacionId") REFERENCES "Evaluacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publicacion" ADD CONSTRAINT "Publicacion_autorAlumnoId_fkey" FOREIGN KEY ("autorAlumnoId") REFERENCES "Alumno"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Publicacion" ADD CONSTRAINT "Publicacion_autorDocenteId_fkey" FOREIGN KEY ("autorDocenteId") REFERENCES "Docente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publicacion" ADD CONSTRAINT "Publicacion_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES "Catedra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publicacion" ADD CONSTRAINT "Publicacion_evaluacionAsignacionId_fkey" FOREIGN KEY ("evaluacionAsignacionId") REFERENCES "EvaluacionAsignacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publicacion" ADD CONSTRAINT "Publicacion_evaluacionMaestraId_fkey" FOREIGN KEY ("evaluacionMaestraId") REFERENCES "Evaluacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publicacion" ADD CONSTRAINT "Publicacion_tareaMaestraId_fkey" FOREIGN KEY ("tareaMaestraId") REFERENCES "TareaMaestra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicacionInteraccion" ADD CONSTRAINT "PublicacionInteraccion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PublicacionInteraccion" ADD CONSTRAINT "PublicacionInteraccion_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "Docente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicacionInteraccion" ADD CONSTRAINT "PublicacionInteraccion_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES "Publicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Puntuacion" ADD CONSTRAINT "Puntuacion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Puntuacion" ADD CONSTRAINT "Puntuacion_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES "Catedra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_composerId_fkey" FOREIGN KEY ("composerId") REFERENCES "Composer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespuestaAlumno" ADD CONSTRAINT "RespuestaAlumno_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RespuestaAlumno" ADD CONSTRAINT "RespuestaAlumno_opcionElegidaId_fkey" FOREIGN KEY ("opcionElegidaId") REFERENCES "Opcion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespuestaAlumno" ADD CONSTRAINT "RespuestaAlumno_preguntaId_fkey" FOREIGN KEY ("preguntaId") REFERENCES "Pregunta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TareaAsignacion" ADD CONSTRAINT "TareaAsignacion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "TareaAsignacion" ADD CONSTRAINT "TareaAsignacion_tareaMaestraId_fkey" FOREIGN KEY ("tareaMaestraId") REFERENCES "TareaMaestra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TareaMaestra" ADD CONSTRAINT "TareaMaestra_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES "Catedra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TareaMaestra" ADD CONSTRAINT "TareaMaestra_unidadPlanId_fkey" FOREIGN KEY ("unidadPlanId") REFERENCES "UnidadPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnidadPlan" ADD CONSTRAINT "UnidadPlan_planDeClasesId_fkey" FOREIGN KEY ("planDeClasesId") REFERENCES "PlanDeClases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

