--
-- PostgreSQL database dump
--

-- Dumped from database version 12.22 (Ubuntu 12.22-0ubuntu0.20.04.4)
-- Dumped by pg_dump version 12.22 (Ubuntu 12.22-0ubuntu0.20.04.4)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: EstadoEvaluacionAsignacion; Type: TYPE; Schema: public; Owner: composer_user
--

CREATE TYPE public."EstadoEvaluacionAsignacion" AS ENUM (
    'PENDIENTE',
    'REALIZADA',
    'CALIFICADA',
    'VENCIDA'
);


ALTER TYPE public."EstadoEvaluacionAsignacion" OWNER TO composer_user;

--
-- Name: EstadoTarea; Type: TYPE; Schema: public; Owner: composer_user
--

CREATE TYPE public."EstadoTarea" AS ENUM (
    'ASIGNADA',
    'ENTREGADA',
    'CALIFICADA',
    'VENCIDA'
);


ALTER TYPE public."EstadoTarea" OWNER TO composer_user;

--
-- Name: ModalidadPago; Type: TYPE; Schema: public; Owner: composer_user
--

CREATE TYPE public."ModalidadPago" AS ENUM (
    'PARTICULAR',
    'INSTITUCIONAL'
);


ALTER TYPE public."ModalidadPago" OWNER TO composer_user;

--
-- Name: RoleType; Type: TYPE; Schema: public; Owner: composer_user
--

CREATE TYPE public."RoleType" AS ENUM (
    'COMPOSER',
    'POET',
    'CONDUCTOR',
    'ARRANGER',
    'PERFORMER',
    'STUDENT',
    'ENSEMBLE_ORCHESTRA'
);


ALTER TYPE public."RoleType" OWNER TO composer_user;

--
-- Name: TipoInteraccionPublicacion; Type: TYPE; Schema: public; Owner: composer_user
--

CREATE TYPE public."TipoInteraccionPublicacion" AS ENUM (
    'ME_GUSTA'
);


ALTER TYPE public."TipoInteraccionPublicacion" OWNER TO composer_user;

--
-- Name: TipoOrganizacionPlan; Type: TYPE; Schema: public; Owner: composer_user
--

CREATE TYPE public."TipoOrganizacionPlan" AS ENUM (
    'MES',
    'MODULO'
);


ALTER TYPE public."TipoOrganizacionPlan" OWNER TO composer_user;

--
-- Name: TipoPago; Type: TYPE; Schema: public; Owner: composer_user
--

CREATE TYPE public."TipoPago" AS ENUM (
    'MATRICULA',
    'CUOTA',
    'OTRO'
);


ALTER TYPE public."TipoPago" OWNER TO composer_user;

--
-- Name: TipoPublicacion; Type: TYPE; Schema: public; Owner: composer_user
--

CREATE TYPE public."TipoPublicacion" AS ENUM (
    'ANUNCIO',
    'TAREA',
    'EVALUACION',
    'OTRO',
    'TAREA_ASIGNADA'
);


ALTER TYPE public."TipoPublicacion" OWNER TO composer_user;

--
-- Name: TipoPuntuacion; Type: TYPE; Schema: public; Owner: composer_user
--

CREATE TYPE public."TipoPuntuacion" AS ENUM (
    'TAREA',
    'EVALUACION',
    'APORTE'
);


ALTER TYPE public."TipoPuntuacion" OWNER TO composer_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Alumno; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public."Alumno" (
    id integer NOT NULL,
    nombre text NOT NULL,
    apellido text NOT NULL,
    email text NOT NULL,
    telefono text,
    direccion text,
    instrumento text,
    detalles_adicionales text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    nombre_tutor text,
    telefono_tutor text,
    vive_con_padres boolean DEFAULT false
);


ALTER TABLE public."Alumno" OWNER TO composer_user;

--
-- Name: Alumno_id_seq; Type: SEQUENCE; Schema: public; Owner: composer_user
--

CREATE SEQUENCE public."Alumno_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Alumno_id_seq" OWNER TO composer_user;

--
-- Name: Alumno_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: composer_user
--

ALTER SEQUENCE public."Alumno_id_seq" OWNED BY public."Alumno".id;


--
-- Name: Asistencia; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public."Asistencia" (
    id integer NOT NULL,
    presente boolean NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "alumnoId" integer NOT NULL,
    "diaClaseId" integer NOT NULL
);


ALTER TABLE public."Asistencia" OWNER TO composer_user;

--
-- Name: Asistencia_id_seq; Type: SEQUENCE; Schema: public; Owner: composer_user
--

CREATE SEQUENCE public."Asistencia_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Asistencia_id_seq" OWNER TO composer_user;

--
-- Name: Asistencia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: composer_user
--

ALTER SEQUENCE public."Asistencia_id_seq" OWNED BY public."Asistencia".id;


--
-- Name: CalificacionEvaluacion; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public."CalificacionEvaluacion" (
    id integer NOT NULL,
    puntos integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "alumnoId" integer NOT NULL,
    "evaluacionAsignacionId" integer NOT NULL
);


ALTER TABLE public."CalificacionEvaluacion" OWNER TO composer_user;

--
-- Name: CalificacionEvaluacion_id_seq; Type: SEQUENCE; Schema: public; Owner: composer_user
--

CREATE SEQUENCE public."CalificacionEvaluacion_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."CalificacionEvaluacion_id_seq" OWNER TO composer_user;

--
-- Name: CalificacionEvaluacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: composer_user
--

ALTER SEQUENCE public."CalificacionEvaluacion_id_seq" OWNED BY public."CalificacionEvaluacion".id;


--
-- Name: Catedra; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public."Catedra" (
    id integer NOT NULL,
    nombre text NOT NULL,
    anio integer NOT NULL,
    institucion text NOT NULL,
    turno text NOT NULL,
    aula text NOT NULL,
    dias text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    "docenteId" integer,
    modalidad_pago public."ModalidadPago" DEFAULT 'PARTICULAR'::public."ModalidadPago" NOT NULL
);


ALTER TABLE public."Catedra" OWNER TO composer_user;

--
-- Name: CatedraAlumno; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public."CatedraAlumno" (
    "catedraId" integer NOT NULL,
    "alumnoId" integer,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "assignedBy" text NOT NULL,
    "composerId" integer,
    id integer NOT NULL,
    dia_cobro integer,
    fecha_inscripcion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CatedraAlumno" OWNER TO composer_user;

--
-- Name: CatedraAlumno_id_seq; Type: SEQUENCE; Schema: public; Owner: composer_user
--

CREATE SEQUENCE public."CatedraAlumno_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."CatedraAlumno_id_seq" OWNER TO composer_user;

--
-- Name: CatedraAlumno_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: composer_user
--

ALTER SEQUENCE public."CatedraAlumno_id_seq" OWNED BY public."CatedraAlumno".id;


--
-- Name: CatedraDiaHorario; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public."CatedraDiaHorario" (
    id integer NOT NULL,
    dia_semana text NOT NULL,
    hora_inicio text NOT NULL,
    hora_fin text NOT NULL,
    "catedraId" integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CatedraDiaHorario" OWNER TO composer_user;

--
-- Name: CatedraDiaHorario_id_seq; Type: SEQUENCE; Schema: public; Owner: composer_user
--

CREATE SEQUENCE public."CatedraDiaHorario_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."CatedraDiaHorario_id_seq" OWNER TO composer_user;

--
-- Name: CatedraDiaHorario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: composer_user
--

ALTER SEQUENCE public."CatedraDiaHorario_id_seq" OWNED BY public."CatedraDiaHorario".id;


--
-- Name: Catedra_id_seq; Type: SEQUENCE; Schema: public; Owner: composer_user
--

CREATE SEQUENCE public."Catedra_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Catedra_id_seq" OWNER TO composer_user;

--
-- Name: Catedra_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: composer_user
--

ALTER SEQUENCE public."Catedra_id_seq" OWNED BY public."Catedra".id;


--
-- Name: ComentarioPublicacion; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public."ComentarioPublicacion" (
    id integer NOT NULL,
    texto text NOT NULL,
    "publicacionId" integer NOT NULL,
    "autorAlumnoId" integer,
    "autorDocenteId" integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ComentarioPublicacion" OWNER TO composer_user;

--
-- Name: ComentarioPublicacion_id_seq; Type: SEQUENCE; Schema: public; Owner: composer_user
--

CREATE SEQUENCE public."ComentarioPublicacion_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ComentarioPublicacion_id_seq" OWNER TO composer_user;

--
-- Name: ComentarioPublicacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: composer_user
--

ALTER SEQUENCE public."ComentarioPublicacion_id_seq" OWNED BY public."ComentarioPublicacion".id;


--
-- Name: Comment; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public."Comment" (
    id integer NOT NULL,
    text text NOT NULL,
    "composerId" integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip_address text,
    name text NOT NULL
);


ALTER TABLE public."Comment" OWNER TO composer_user;

--
-- Name: Comment_id_seq; Type: SEQUENCE; Schema: public; Owner: composer_user
--

CREATE SEQUENCE public."Comment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Comment_id_seq" OWNER TO composer_user;

--
-- Name: Comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: composer_user
--

ALTER SEQUENCE public."Comment_id_seq" OWNED BY public."Comment".id;


--
-- Name: Composer; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public."Composer" (
    id integer NOT NULL,
    bio text NOT NULL,
    birth_day integer,
    birth_month integer,
    birth_year integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    death_day integer,
    death_month integer,
    death_year integer,
    email text NOT NULL,
    first_name text NOT NULL,
    ip_address text,
    last_name text NOT NULL,
    notable_works text NOT NULL,
    photo_url text,
    quality text,
    "references" text,
    status text DEFAULT 'PENDING_REVIEW'::text NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    youtube_link text,
    period text NOT NULL,
    "mainRole" public."RoleType"[],
    completeness_score integer,
    rejection_reason text,
    is_student_contribution boolean DEFAULT false NOT NULL,
    student_first_name text,
    student_last_name text,
    suggestion_reason text
);


ALTER TABLE public."Composer" OWNER TO composer_user;

--
-- Name: Composer_id_seq; Type: SEQUENCE; Schema: public; Owner: composer_user
--

CREATE SEQUENCE public."Composer_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Composer_id_seq" OWNER TO composer_user;

--
-- Name: Composer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: composer_user
--

ALTER SEQUENCE public."Composer_id_seq" OWNED BY public."Composer".id;


--
-- Name: CostoCatedra; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public."CostoCatedra" (
    id integer NOT NULL,
    "catedraId" integer NOT NULL,
    monto_matricula double precision,
    monto_cuota double precision,
    es_gratuita boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CostoCatedra" OWNER TO composer_user;

--
-- Name: CostoCatedra_id_seq; Type: SEQUENCE; Schema: public; Owner: composer_user
--

CREATE SEQUENCE public."CostoCatedra_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."CostoCatedra_id_seq" OWNER TO composer_user;

--
-- Name: CostoCatedra_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: composer_user
--

ALTER SEQUENCE public."CostoCatedra_id_seq" OWNED BY public."CostoCatedra".id;


--
-- Name: DiaClase; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public."DiaClase" (
    id integer NOT NULL,
    fecha timestamp(3) without time zone NOT NULL,
    dia_semana text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    "catedraId" integer NOT NULL
);


ALTER TABLE public."DiaClase" OWNER TO composer_user;

--
-- Name: DiaClase_id_seq; Type: SEQUENCE; Schema: public; Owner: composer_user
--

CREATE SEQUENCE public."DiaClase_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."DiaClase_id_seq" OWNER TO composer_user;

--
-- Name: DiaClase_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: composer_user
--

ALTER SEQUENCE public."DiaClase_id_seq" OWNED BY public."DiaClase".id;


--
-- Name: Docente; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public."Docente" (
    id integer NOT NULL,
    nombre text NOT NULL,
    apellido text NOT NULL,
    email text NOT NULL,
    "otpSecret" text,
    "otpEnabled" boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    direccion text,
    telefono text
);


ALTER TABLE public."Docente" OWNER TO composer_user;

--
-- Name: Docente_id_seq; Type: SEQUENCE; Schema: public; Owner: composer_user
--

CREATE SEQUENCE public."Docente_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Docente_id_seq" OWNER TO composer_user;

--
-- Name: Docente_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: composer_user
--

ALTER SEQUENCE public."Docente_id_seq" OWNED BY public."Docente".id;


--
-- Name: EditSuggestion; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public."EditSuggestion" (
    id integer NOT NULL,
    first_name text,
    last_name text,
    birth_year integer,
    birth_month integer,
    birth_day integer,
    death_year integer,
    death_month integer,
    death_day integer,
    bio text,
    notable_works text,
    period text,
    "references" text,
    youtube_link text,
    "mainRole" public."RoleType"[],
    reason text NOT NULL,
    status text DEFAULT 'PENDING_REVIEW'::text NOT NULL,
    suggester_email text NOT NULL,
    suggester_ip text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    "composerId" integer NOT NULL,
    is_student_contribution boolean DEFAULT false,
    student_first_name text,
    student_last_name text,
    points integer DEFAULT 0 NOT NULL,
    photo_url text
);


ALTER TABLE public."EditSuggestion" OWNER TO composer_user;

--
-- Name: EditSuggestion_id_seq; Type: SEQUENCE; Schema: public; Owner: composer_user
--

CREATE SEQUENCE public."EditSuggestion_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."EditSuggestion_id_seq" OWNER TO composer_user;

--
-- Name: EditSuggestion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: composer_user
--

ALTER SEQUENCE public."EditSuggestion_id_seq" OWNED BY public."EditSuggestion".id;


--
-- Name: Evaluacion; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public."Evaluacion" (
    id integer NOT NULL,
    titulo text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "catedraId" integer NOT NULL,
    fecha_limite timestamp(3) without time zone,
    "isMaster" boolean DEFAULT true NOT NULL,
    "unidadPlanId" integer
);


ALTER TABLE public."Evaluacion" OWNER TO composer_user;

--
-- Name: EvaluacionAsignacion; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public."EvaluacionAsignacion" (
    id integer NOT NULL,
    estado public."EstadoEvaluacionAsignacion" DEFAULT 'PENDIENTE'::public."EstadoEvaluacionAsignacion" NOT NULL,
    fecha_entrega timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    "alumnoId" integer NOT NULL,
    "evaluacionId" integer NOT NULL,
    "publicacionId" integer
);


ALTER TABLE public."EvaluacionAsignacion" OWNER TO composer_user;

--
-- Name: EvaluacionAsignacion_id_seq; Type: SEQUENCE; Schema: public; Owner: composer_user
--

CREATE SEQUENCE public."EvaluacionAsignacion_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."EvaluacionAsignacion_id_seq" OWNER TO composer_user;

--
-- Name: EvaluacionAsignacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: composer_user
--

ALTER SEQUENCE public."EvaluacionAsignacion_id_seq" OWNED BY public."EvaluacionAsignacion".id;


--
-- Name: Evaluacion_id_seq; Type: SEQUENCE; Schema: public; Owner: composer_user
--

CREATE SEQUENCE public."Evaluacion_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Evaluacion_id_seq" OWNER TO composer_user;

--
-- Name: Evaluacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: composer_user
--

ALTER SEQUENCE public."Evaluacion_id_seq" OWNED BY public."Evaluacion".id;


--
-- Name: Opcion; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public."Opcion" (
    id integer NOT NULL,
    texto text NOT NULL,
    es_correcta boolean DEFAULT false NOT NULL,
    "preguntaId" integer NOT NULL
);


ALTER TABLE public."Opcion" OWNER TO composer_user;

--
-- Name: Opcion_id_seq; Type: SEQUENCE; Schema: public; Owner: composer_user
--

CREATE SEQUENCE public."Opcion_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Opcion_id_seq" OWNER TO composer_user;

--
-- Name: Opcion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: composer_user
--

ALTER SEQUENCE public."Opcion_id_seq" OWNED BY public."Opcion".id;


--
-- Name: Otp; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public."Otp" (
    id integer NOT NULL,
    email text NOT NULL,
    code text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Otp" OWNER TO composer_user;

--
-- Name: Otp_id_seq; Type: SEQUENCE; Schema: public; Owner: composer_user
--

CREATE SEQUENCE public."Otp_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Otp_id_seq" OWNER TO composer_user;

--
-- Name: Otp_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: composer_user
--

ALTER SEQUENCE public."Otp_id_seq" OWNED BY public."Otp".id;


--
-- Name: Pago; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public."Pago" (
    id integer NOT NULL,
    "catedraAlumnoId" integer NOT NULL,
    fecha_pago timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    monto_pagado double precision NOT NULL,
    tipo_pago public."TipoPago" NOT NULL,
    periodo_cubierto text,
    "confirmadoPorId" integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Pago" OWNER TO composer_user;

--
-- Name: Pago_id_seq; Type: SEQUENCE; Schema: public; Owner: composer_user
--

CREATE SEQUENCE public."Pago_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Pago_id_seq" OWNER TO composer_user;

--
-- Name: Pago_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: composer_user
--

ALTER SEQUENCE public."Pago_id_seq" OWNED BY public."Pago".id;


--
-- Name: PlanDeClases; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public."PlanDeClases" (
    id integer NOT NULL,
    titulo text NOT NULL,
    "tipoOrganizacion" public."TipoOrganizacionPlan" NOT NULL,
    "docenteId" integer NOT NULL,
    "catedraId" integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PlanDeClases" OWNER TO composer_user;

--
-- Name: PlanDeClases_id_seq; Type: SEQUENCE; Schema: public; Owner: composer_user
--

CREATE SEQUENCE public."PlanDeClases_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."PlanDeClases_id_seq" OWNER TO composer_user;

--
-- Name: PlanDeClases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: composer_user
--

ALTER SEQUENCE public."PlanDeClases_id_seq" OWNED BY public."PlanDeClases".id;


--
-- Name: Pregunta; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public."Pregunta" (
    id integer NOT NULL,
    texto text NOT NULL,
    "evaluacionId" integer NOT NULL
);


ALTER TABLE public."Pregunta" OWNER TO composer_user;

--
-- Name: Pregunta_id_seq; Type: SEQUENCE; Schema: public; Owner: composer_user
--

CREATE SEQUENCE public."Pregunta_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Pregunta_id_seq" OWNER TO composer_user;

--
-- Name: Pregunta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: composer_user
--

ALTER SEQUENCE public."Pregunta_id_seq" OWNED BY public."Pregunta".id;


--
-- Name: Publicacion; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public."Publicacion" (
    id integer NOT NULL,
    titulo text NOT NULL,
    contenido text NOT NULL,
    tipo public."TipoPublicacion" NOT NULL,
    "catedraId" integer NOT NULL,
    "autorAlumnoId" integer,
    "autorDocenteId" integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    "tareaMaestraId" integer,
    "visibleToStudents" boolean DEFAULT false NOT NULL,
    "evaluacionAsignacionId" integer,
    "evaluacionMaestraId" integer
);


ALTER TABLE public."Publicacion" OWNER TO composer_user;

--
-- Name: PublicacionInteraccion; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public."PublicacionInteraccion" (
    id integer NOT NULL,
    "publicacionId" integer NOT NULL,
    "alumnoId" integer,
    "docenteId" integer,
    tipo public."TipoInteraccionPublicacion" DEFAULT 'ME_GUSTA'::public."TipoInteraccionPublicacion" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PublicacionInteraccion" OWNER TO composer_user;

--
-- Name: PublicacionInteraccion_id_seq; Type: SEQUENCE; Schema: public; Owner: composer_user
--

CREATE SEQUENCE public."PublicacionInteraccion_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."PublicacionInteraccion_id_seq" OWNER TO composer_user;

--
-- Name: PublicacionInteraccion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: composer_user
--

ALTER SEQUENCE public."PublicacionInteraccion_id_seq" OWNED BY public."PublicacionInteraccion".id;


--
-- Name: Publicacion_id_seq; Type: SEQUENCE; Schema: public; Owner: composer_user
--

CREATE SEQUENCE public."Publicacion_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Publicacion_id_seq" OWNER TO composer_user;

--
-- Name: Publicacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: composer_user
--

ALTER SEQUENCE public."Publicacion_id_seq" OWNED BY public."Publicacion".id;


--
-- Name: Puntuacion; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public."Puntuacion" (
    id integer NOT NULL,
    puntos integer NOT NULL,
    motivo text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "alumnoId" integer NOT NULL,
    "catedraId" integer,
    tipo public."TipoPuntuacion" NOT NULL
);


ALTER TABLE public."Puntuacion" OWNER TO composer_user;

--
-- Name: Puntuacion_id_seq; Type: SEQUENCE; Schema: public; Owner: composer_user
--

CREATE SEQUENCE public."Puntuacion_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Puntuacion_id_seq" OWNER TO composer_user;

--
-- Name: Puntuacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: composer_user
--

ALTER SEQUENCE public."Puntuacion_id_seq" OWNED BY public."Puntuacion".id;


--
-- Name: Rating; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public."Rating" (
    id integer NOT NULL,
    rating_value integer NOT NULL,
    ip_address text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "composerId" integer NOT NULL
);


ALTER TABLE public."Rating" OWNER TO composer_user;

--
-- Name: Rating_id_seq; Type: SEQUENCE; Schema: public; Owner: composer_user
--

CREATE SEQUENCE public."Rating_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Rating_id_seq" OWNER TO composer_user;

--
-- Name: Rating_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: composer_user
--

ALTER SEQUENCE public."Rating_id_seq" OWNED BY public."Rating".id;


--
-- Name: RespuestaAlumno; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public."RespuestaAlumno" (
    id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "alumnoId" integer NOT NULL,
    "preguntaId" integer NOT NULL,
    "opcionElegidaId" integer NOT NULL
);


ALTER TABLE public."RespuestaAlumno" OWNER TO composer_user;

--
-- Name: RespuestaAlumno_id_seq; Type: SEQUENCE; Schema: public; Owner: composer_user
--

CREATE SEQUENCE public."RespuestaAlumno_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."RespuestaAlumno_id_seq" OWNER TO composer_user;

--
-- Name: RespuestaAlumno_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: composer_user
--

ALTER SEQUENCE public."RespuestaAlumno_id_seq" OWNED BY public."RespuestaAlumno".id;


--
-- Name: TareaAsignacion; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public."TareaAsignacion" (
    id integer NOT NULL,
    estado public."EstadoTarea" DEFAULT 'ASIGNADA'::public."EstadoTarea" NOT NULL,
    submission_path text,
    submission_date timestamp(3) without time zone,
    puntos_obtenidos integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    "alumnoId" integer NOT NULL,
    "tareaMaestraId" integer NOT NULL,
    comentario_docente text
);


ALTER TABLE public."TareaAsignacion" OWNER TO composer_user;

--
-- Name: TareaAsignacion_id_seq; Type: SEQUENCE; Schema: public; Owner: composer_user
--

CREATE SEQUENCE public."TareaAsignacion_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."TareaAsignacion_id_seq" OWNER TO composer_user;

--
-- Name: TareaAsignacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: composer_user
--

ALTER SEQUENCE public."TareaAsignacion_id_seq" OWNED BY public."TareaAsignacion".id;


--
-- Name: TareaMaestra; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public."TareaMaestra" (
    id integer NOT NULL,
    titulo text NOT NULL,
    descripcion text NOT NULL,
    fecha_entrega timestamp(3) without time zone,
    puntos_posibles integer NOT NULL,
    recursos text[] DEFAULT ARRAY[]::text[],
    multimedia_path text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    "catedraId" integer NOT NULL,
    "publicacionId" integer,
    "unidadPlanId" integer
);


ALTER TABLE public."TareaMaestra" OWNER TO composer_user;

--
-- Name: TareaMaestra_id_seq; Type: SEQUENCE; Schema: public; Owner: composer_user
--

CREATE SEQUENCE public."TareaMaestra_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."TareaMaestra_id_seq" OWNER TO composer_user;

--
-- Name: TareaMaestra_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: composer_user
--

ALTER SEQUENCE public."TareaMaestra_id_seq" OWNED BY public."TareaMaestra".id;


--
-- Name: UnidadPlan; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public."UnidadPlan" (
    id integer NOT NULL,
    "planDeClasesId" integer NOT NULL,
    periodo text NOT NULL,
    contenido text NOT NULL,
    capacidades text NOT NULL,
    "horasTeoricas" integer NOT NULL,
    "horasPracticas" integer NOT NULL,
    "estrategiasMetodologicas" text NOT NULL,
    "mediosVerificacionEvaluacion" text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    recursos jsonb[] DEFAULT ARRAY[]::jsonb[]
);


ALTER TABLE public."UnidadPlan" OWNER TO composer_user;

--
-- Name: UnidadPlan_id_seq; Type: SEQUENCE; Schema: public; Owner: composer_user
--

CREATE SEQUENCE public."UnidadPlan_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."UnidadPlan_id_seq" OWNER TO composer_user;

--
-- Name: UnidadPlan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: composer_user
--

ALTER SEQUENCE public."UnidadPlan_id_seq" OWNED BY public."UnidadPlan".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL
);


ALTER TABLE public."User" OWNER TO composer_user;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: composer_user
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."User_id_seq" OWNER TO composer_user;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: composer_user
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: composer_user
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO composer_user;

--
-- Name: Alumno id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Alumno" ALTER COLUMN id SET DEFAULT nextval('public."Alumno_id_seq"'::regclass);


--
-- Name: Asistencia id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Asistencia" ALTER COLUMN id SET DEFAULT nextval('public."Asistencia_id_seq"'::regclass);


--
-- Name: CalificacionEvaluacion id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."CalificacionEvaluacion" ALTER COLUMN id SET DEFAULT nextval('public."CalificacionEvaluacion_id_seq"'::regclass);


--
-- Name: Catedra id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Catedra" ALTER COLUMN id SET DEFAULT nextval('public."Catedra_id_seq"'::regclass);


--
-- Name: CatedraAlumno id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."CatedraAlumno" ALTER COLUMN id SET DEFAULT nextval('public."CatedraAlumno_id_seq"'::regclass);


--
-- Name: CatedraDiaHorario id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."CatedraDiaHorario" ALTER COLUMN id SET DEFAULT nextval('public."CatedraDiaHorario_id_seq"'::regclass);


--
-- Name: ComentarioPublicacion id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."ComentarioPublicacion" ALTER COLUMN id SET DEFAULT nextval('public."ComentarioPublicacion_id_seq"'::regclass);


--
-- Name: Comment id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Comment" ALTER COLUMN id SET DEFAULT nextval('public."Comment_id_seq"'::regclass);


--
-- Name: Composer id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Composer" ALTER COLUMN id SET DEFAULT nextval('public."Composer_id_seq"'::regclass);


--
-- Name: CostoCatedra id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."CostoCatedra" ALTER COLUMN id SET DEFAULT nextval('public."CostoCatedra_id_seq"'::regclass);


--
-- Name: DiaClase id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."DiaClase" ALTER COLUMN id SET DEFAULT nextval('public."DiaClase_id_seq"'::regclass);


--
-- Name: Docente id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Docente" ALTER COLUMN id SET DEFAULT nextval('public."Docente_id_seq"'::regclass);


--
-- Name: EditSuggestion id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."EditSuggestion" ALTER COLUMN id SET DEFAULT nextval('public."EditSuggestion_id_seq"'::regclass);


--
-- Name: Evaluacion id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Evaluacion" ALTER COLUMN id SET DEFAULT nextval('public."Evaluacion_id_seq"'::regclass);


--
-- Name: EvaluacionAsignacion id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."EvaluacionAsignacion" ALTER COLUMN id SET DEFAULT nextval('public."EvaluacionAsignacion_id_seq"'::regclass);


--
-- Name: Opcion id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Opcion" ALTER COLUMN id SET DEFAULT nextval('public."Opcion_id_seq"'::regclass);


--
-- Name: Otp id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Otp" ALTER COLUMN id SET DEFAULT nextval('public."Otp_id_seq"'::regclass);


--
-- Name: Pago id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Pago" ALTER COLUMN id SET DEFAULT nextval('public."Pago_id_seq"'::regclass);


--
-- Name: PlanDeClases id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."PlanDeClases" ALTER COLUMN id SET DEFAULT nextval('public."PlanDeClases_id_seq"'::regclass);


--
-- Name: Pregunta id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Pregunta" ALTER COLUMN id SET DEFAULT nextval('public."Pregunta_id_seq"'::regclass);


--
-- Name: Publicacion id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Publicacion" ALTER COLUMN id SET DEFAULT nextval('public."Publicacion_id_seq"'::regclass);


--
-- Name: PublicacionInteraccion id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."PublicacionInteraccion" ALTER COLUMN id SET DEFAULT nextval('public."PublicacionInteraccion_id_seq"'::regclass);


--
-- Name: Puntuacion id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Puntuacion" ALTER COLUMN id SET DEFAULT nextval('public."Puntuacion_id_seq"'::regclass);


--
-- Name: Rating id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Rating" ALTER COLUMN id SET DEFAULT nextval('public."Rating_id_seq"'::regclass);


--
-- Name: RespuestaAlumno id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."RespuestaAlumno" ALTER COLUMN id SET DEFAULT nextval('public."RespuestaAlumno_id_seq"'::regclass);


--
-- Name: TareaAsignacion id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."TareaAsignacion" ALTER COLUMN id SET DEFAULT nextval('public."TareaAsignacion_id_seq"'::regclass);


--
-- Name: TareaMaestra id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."TareaMaestra" ALTER COLUMN id SET DEFAULT nextval('public."TareaMaestra_id_seq"'::regclass);


--
-- Name: UnidadPlan id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."UnidadPlan" ALTER COLUMN id SET DEFAULT nextval('public."UnidadPlan_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: Alumno; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."Alumno" (id, nombre, apellido, email, telefono, direccion, instrumento, detalles_adicionales, created_at, updated_at, nombre_tutor, telefono_tutor, vive_con_padres) FROM stdin;
3	Adam Joshua	Park	adamjoshuapark@gmail.com	0972408400	Coronel Irrazabal c/ Azara	Violoncello	Alumno no sabe sus otras materias	2025-10-02 20:02:13.67	2025-10-02 20:02:13.67	JIna Park	0971170515	f
4	Luna Abigail	Benitez Cañete	lunabeni46@gmail.com	0992669184	Yegros y Samudio Corrales	Violin 	Audiopercetpiva, Orquesta, Instrumento	2025-10-02 20:05:28.459	2025-10-02 20:05:28.459	Karina Marisbel Cañete	0992669184	f
5	Santiago Josué	Cruz Valdez	santiagojosuevaldezcruz2011@gmail.com	0976120549	Isla Aranda - Limpio	Piano Clásico	Teoría I, Instrumento, Ensamble	2025-10-02 20:08:14.321	2025-10-02 20:08:14.321	Carolina Arce 	09814293925	f
6	Ricardo Antonio 	Frutos Sánchez	ricardofrutos86@gmail.com	0981215311	7ma Pyda 825 c/ Ayolas	Guitarra Eléctrica	Teoría I, Informática, Instrumento, Ensamble de Jazz	2025-10-02 20:09:53.021	2025-10-02 20:09:53.021	\N	\N	f
7	Fabrizio Maxiliano 	Ruíz Ortega	fabroj777@gmail.com	0991995951	Tte Rojas Silva y 21 Proyectadas	Guitarra Eléctrica	Teoría I, Informática, Ensamble de Jazz, Instrumento	2025-10-02 20:14:06.766	2025-10-02 20:14:06.766	\N	\N	f
8	Kathia Verenize	González Amarilla	kathiayiya@gmail.com	0984200962	Urundey c/ Concepción - Barrio Hipódromo 	Piano Clásico	Teoría I, Instrumento, Ensamble	2025-10-02 20:16:49.709	2025-10-02 20:16:49.709	\N	\N	f
9	Iván Lorenzo	Domaniczky	ivandomaniczky@hotmail.com	0994281941	Mcal Estigarribia c/ Mayor Fleitas	Piano Clásico	Tteoria I, Instrumento, Coro Polifónico	2025-10-02 20:19:10.919	2025-10-02 20:19:10.919	\N	\N	f
10	Angel Gabriel 	Rodríguez Galeano	anglrodga@gmai.com	0981854219	Estados Unidos, 16 e/ 17 Pyda	Guitarra Clásica	Instrumento, Teoría I, Coro Polifónico	2025-10-02 20:22:07.626	2025-10-02 20:22:07.626	\N	\N	f
2	Julio	Franco	jucfra23@gmail.com	0981574711	Laurelty 4565, Luque - Paraguay	Cello	Usuario de prueba (docente y alumno).	2025-10-02 15:01:19.677	2025-10-04 00:12:12.585	\N	\N	f
1	Alumno	Prueba	filoartepy@gmail.com	111222333	Calle Falsa 123, Ciudad de Prueba	Piano	Alumno utilizado para pruebas.	2025-10-02 15:01:19.64	2025-10-04 00:12:47.321	\N	\N	t
11	Leandro Esteban	Lugo Ruiz	leandrolugo129@gmail.com	\N	\N	\N	\N	2025-11-06 12:24:35.914	2025-11-06 12:24:35.914	\N	\N	f
12	Liz Vanessa	Britez Gomez	lizvanesabritezgomez@gmail.com	\N	\N	\N	\N	2025-11-06 12:24:35.921	2025-11-06 12:24:35.921	\N	\N	f
13	Lourdes Natalia	Meza Escurra	loumeza85@gmail.com	\N	\N	\N	\N	2025-11-06 12:24:35.929	2025-11-06 12:24:35.929	\N	\N	f
14	Carmina Araceli	Colman Martinez	carminacolman@gmail.com	\N	\N	\N	\N	2025-11-06 12:24:35.939	2025-11-06 12:24:35.939	\N	\N	f
15	Bruno Matias	Monges Arias	brunomonges0@gmail.com	\N	\N	\N	\N	2025-11-06 12:24:35.948	2025-11-06 12:24:35.948	\N	\N	f
16	Jacqueline	Ibañez Escurra	ibanezjacqueline11@gmail.com	\N	\N	\N	\N	2025-11-06 12:24:35.955	2025-11-06 12:24:35.955	\N	\N	f
17	Sebastian	Mendoza	mendosanseb@gmail.com	\N	\N	\N	\N	2025-11-06 12:24:35.962	2025-11-06 12:24:35.962	\N	\N	f
\.


--
-- Data for Name: Asistencia; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."Asistencia" (id, presente, created_at, "alumnoId", "diaClaseId") FROM stdin;
\.


--
-- Data for Name: CalificacionEvaluacion; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."CalificacionEvaluacion" (id, puntos, created_at, "alumnoId", "evaluacionAsignacionId") FROM stdin;
1	80	2025-11-06 12:24:36.167	3	1
2	80	2025-11-06 12:24:36.172	4	2
3	80	2025-11-06 12:24:36.177	5	3
4	80	2025-11-06 12:24:36.181	6	4
5	80	2025-11-06 12:24:36.184	7	5
6	80	2025-11-06 12:24:36.187	8	6
7	80	2025-11-06 12:24:36.19	9	7
8	80	2025-11-06 12:24:36.192	10	8
9	80	2025-11-06 12:24:36.196	2	9
10	80	2025-11-06 12:24:36.201	1	10
11	80	2025-11-06 12:24:36.205	16	11
12	80	2025-11-06 12:24:36.207	17	12
13	0	2025-11-06 12:24:36.286	3	13
14	0	2025-11-06 12:24:36.288	4	14
15	0	2025-11-06 12:24:36.29	5	15
16	0	2025-11-06 12:24:36.292	6	16
17	0	2025-11-06 12:24:36.294	7	17
18	0	2025-11-06 12:24:36.296	8	18
19	0	2025-11-06 12:24:36.299	9	19
20	0	2025-11-06 12:24:36.301	10	20
21	0	2025-11-06 12:24:36.303	2	21
22	0	2025-11-06 12:24:36.305	1	22
23	0	2025-11-06 12:24:36.307	16	23
24	0	2025-11-06 12:24:36.309	17	24
25	0	2025-11-06 12:24:36.312	11	25
26	0	2025-11-06 12:24:36.315	12	26
27	0	2025-11-06 12:24:36.317	13	27
28	0	2025-11-06 12:24:36.319	14	28
29	0	2025-11-06 12:24:36.322	15	29
30	0	2025-11-06 12:24:36.328	11	30
31	0	2025-11-06 12:24:36.332	12	31
32	0	2025-11-06 12:24:36.335	13	32
33	0	2025-11-06 12:24:36.339	14	33
34	0	2025-11-06 12:24:36.342	15	34
\.


--
-- Data for Name: Catedra; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."Catedra" (id, nombre, anio, institucion, turno, aula, dias, created_at, updated_at, "docenteId", modalidad_pago) FROM stdin;
1	Introducción a la Filosofía	2025	Conservatorio Nacional de Música	Tarde	Aula 201	Jueves	2025-11-06 12:24:35.851	2025-11-06 12:24:35.851	1	PARTICULAR
2	Historia de la Música del Paraguay	2025	Conservatorio Nacional de Música	Mañana	Aula 101	Jueves	2025-11-06 12:24:35.866	2025-11-06 12:24:35.866	1	PARTICULAR
\.


--
-- Data for Name: CatedraAlumno; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."CatedraAlumno" ("catedraId", "alumnoId", "assignedAt", "assignedBy", "composerId", id, dia_cobro, fecha_inscripcion) FROM stdin;
2	3	2025-11-06 12:24:35.883	Julio Franco	\N	1	\N	2025-11-06 12:24:35.882
2	4	2025-11-06 12:24:35.888	Julio Franco	\N	2	\N	2025-11-06 12:24:35.887
2	5	2025-11-06 12:24:35.89	Julio Franco	\N	3	\N	2025-11-06 12:24:35.89
2	6	2025-11-06 12:24:35.893	Julio Franco	\N	4	\N	2025-11-06 12:24:35.892
2	7	2025-11-06 12:24:35.896	Julio Franco	\N	5	\N	2025-11-06 12:24:35.895
2	8	2025-11-06 12:24:35.899	Julio Franco	\N	6	\N	2025-11-06 12:24:35.898
2	9	2025-11-06 12:24:35.902	Julio Franco	\N	7	\N	2025-11-06 12:24:35.901
2	10	2025-11-06 12:24:35.906	Julio Franco	\N	8	\N	2025-11-06 12:24:35.905
2	2	2025-11-06 12:24:35.908	Julio Franco	\N	9	\N	2025-11-06 12:24:35.908
2	1	2025-11-06 12:24:35.911	Julio Franco	\N	10	\N	2025-11-06 12:24:35.911
1	11	2025-11-06 12:24:35.918	Julio Franco	\N	11	\N	2025-11-06 12:24:35.917
1	12	2025-11-06 12:24:35.926	Julio Franco	\N	12	\N	2025-11-06 12:24:35.925
1	13	2025-11-06 12:24:35.936	Julio Franco	\N	13	\N	2025-11-06 12:24:35.935
1	14	2025-11-06 12:24:35.944	Julio Franco	\N	14	\N	2025-11-06 12:24:35.943
1	15	2025-11-06 12:24:35.953	Julio Franco	\N	15	\N	2025-11-06 12:24:35.952
2	16	2025-11-06 12:24:35.96	Julio Franco	\N	16	\N	2025-11-06 12:24:35.959
2	17	2025-11-06 12:24:35.968	Julio Franco	\N	17	\N	2025-11-06 12:24:35.967
1	2	2025-11-06 13:00:18.139	ADMIN_SYSTEM	\N	18	5	2025-11-06 13:00:18.139
\.


--
-- Data for Name: CatedraDiaHorario; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."CatedraDiaHorario" (id, dia_semana, hora_inicio, hora_fin, "catedraId", created_at, updated_at) FROM stdin;
1	Jueves	16:00	17:00	1	2025-11-06 12:24:35.859	2025-11-06 12:24:35.859
2	Jueves	17:00	18:00	2	2025-11-06 12:24:35.872	2025-11-06 12:24:35.872
\.


--
-- Data for Name: ComentarioPublicacion; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."ComentarioPublicacion" (id, texto, "publicacionId", "autorAlumnoId", "autorDocenteId", created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: Comment; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."Comment" (id, text, "composerId", created_at, ip_address, name) FROM stdin;
\.


--
-- Data for Name: Composer; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."Composer" (id, bio, birth_day, birth_month, birth_year, created_at, death_day, death_month, death_year, email, first_name, ip_address, last_name, notable_works, photo_url, quality, "references", status, updated_at, youtube_link, period, "mainRole", completeness_score, rejection_reason, is_student_contribution, student_first_name, student_last_name, suggestion_reason) FROM stdin;
1	Originario de Nápoles, Italia. Trabajó en las Reducciones de San Ignacio del Paraná entre 1610 y 1640. Despertó entusiasmo en Buenos Aires en 1628 al presentar un grupo de veinte indios, diestros cantores y músicos de vihuelas de arco y otros instrumentos.	1	1	1595	2025-11-06 12:24:35.977	1	1	1664	seed_user_0_1762431875974@example.com	Pedro	127.0.0.1	Comentale	N/A (Se menciona su trabajo formando músicos indígenas).		A		PUBLISHED	2025-11-06 12:24:35.977		COLONIAL	{COMPOSER,PERFORMER}	\N	\N	f	\N	\N	\N
2	Nació en Tournay, Bélgica. Fue maestro de capilla de la corte de Carlos V antes de llegar a América. Arribó a las reducciones en 1617, trabajando intensamente en la Misión de Loreto hasta 1623.	1	1	1584	2025-11-06 12:24:35.982	1	1	1623	seed_user_1_1762431875974@example.com	Jean Vaisseau (Juan	127.0.0.1	Vaseo)	Trajo consigo no pocas piezas de música.		A		PUBLISHED	2025-11-06 12:24:35.982		COLONIAL	{PERFORMER}	\N	\N	f	\N	\N	\N
3	Originario de Abbeville, Amiens, Francia. Llegó al Paraguay en 1616. Desarrolló una valiosa labor docente en las reducciones jesuíticas de San Ignacio, Misiones. Enseñó a los indígenas a pintar y ejecutar instrumentos musicales.	1	1	1588	2025-11-06 12:24:35.985	1	1	1639	seed_user_2_1762431875974@example.com	Luis Berger (Louis	127.0.0.1	Berger)	N/A.		A		PUBLISHED	2025-11-06 12:24:35.985		COLONIAL	{PERFORMER}	\N	\N	f	\N	\N	\N
4	Músico de origen tirolés que llegó a las Reducciones Jesuíticas en 1616, estableciéndose en Yapeyú. Integró el Coro de la Corte Imperial en Viena. Ejecutaba más de 20 instrumentos y fue de los primeros en introducir el arpa en Paraguay.	1	1	1655	2025-11-06 12:24:35.988	1	1	1733	seed_user_3_1762431875974@example.com	Anton Sepp (Joseph Von	127.0.0.1	Reineg)	Fue compositor (no se especifican títulos).		A		PUBLISHED	2025-11-06 12:24:35.988		COLONIAL	{COMPOSER,PERFORMER}	\N	\N	f	\N	\N	\N
5	Nacido en Prato, Italia. Fue el compositor más destacado de su tiempo en Roma y organista de la Chiesa del Gesu. Llegó a América en 1717 y se estableció en Córdoba (Argentina). Su música se hizo muy apreciada por indígenas y misioneros en las reducciones. Su obra sudamericana fue mayormente redescubierta en Bolivia tras siglos de pérdida.	1	1	1688	2025-11-06 12:24:35.992	1	1	1726	seed_user_4_1762431875974@example.com	Domenico	127.0.0.1	Zipoli	De Europa: 'Sonate d’Intavolature per Órgano e Címbalo'. De América: 'Misa en fa', 'La Misa de los Santos Apóstoles', 'La Misa a San Ignacio', 'Letanía', 'Himno Te Deum Laudamus', 'Laudate Pueri'.		A		PUBLISHED	2025-11-06 12:24:35.992		COLONIAL	{COMPOSER,PERFORMER}	\N	\N	f	\N	\N	\N
6	Misionero músico y brillante arquitecto. Diseñó y dirigió la construcción de los principales templos de la reducción de Chiquitos (hoy Bolivia). También se dedicó a construir instrumentos.	1	1	1800	2025-11-06 12:24:35.996	\N	\N	\N	seed_user_5_1762431875974@example.com	Martin	127.0.0.1	Schmid	Creó numerosas obras para el repertorio musical.		A		PUBLISHED	2025-11-06 12:24:35.996		INDETERMINADO	{COMPOSER,PERFORMER}	\N	\N	f	\N	\N	\N
7	Clérigo virtuoso y pretendiente de la Compañía de Jesús. Fue el primer maestro de arte con que contaron los indios.	1	1	1800	2025-11-06 12:24:35.998	\N	\N	\N	seed_user_6_1762431875974@example.com	Rodrigo de	127.0.0.1	Melgarejo	N/A.		A		PUBLISHED	2025-11-06 12:24:35.998		INDETERMINADO	{PERFORMER}	\N	\N	f	\N	\N	\N
8	Maestro de Música que se destacó en la Escuela de Jóvenes Aprendices de Música Militar, fundada en la capital en 1817.	1	1	1800	2025-11-06 12:24:36.001	\N	\N	\N	seed_user_7_1762431875974@example.com	Manuel	127.0.0.1	Sierra	N/A.		A		PUBLISHED	2025-11-06 12:24:36.001		INDETERMINADO	{CONDUCTOR}	\N	\N	f	\N	\N	\N
9	Hermano de Felipe González, de nacionalidad argentina. Contratado en 1820 por el gobierno de Francia como instructor de bandas de música militar. Recontratado en 1853 por C. A. López.	1	1	1800	2025-11-06 12:24:36.003	\N	\N	\N	seed_user_8_1762431875974@example.com	Benjamín	127.0.0.1	González	N/A.		A		PUBLISHED	2025-11-06 12:24:36.003		INDETERMINADO	{PERFORMER}	\N	\N	f	\N	\N	\N
10	Hermano de Benjamín González. Destacado en las bandas de la Capital. Colaborador de Francisco S. de Dupuis en la formación de nuevas agrupaciones.	1	1	1800	2025-11-06 12:24:36.005	\N	\N	\N	seed_user_9_1762431875974@example.com	Felipe González (Felipe Santiago	127.0.0.1	González)	N/A.		A		PUBLISHED	2025-11-06 12:24:36.005		INDETERMINADO	{PERFORMER}	\N	\N	f	\N	\N	\N
11	Director de la primera escuela pública del Paraguay. Músico hábil guitarrista y cantor. Confirmado como director de la Escuela Central de Primeras Letras en 1812. Dirigía conjuntos musicales.	1	1	1800	2025-11-06 12:24:36.007	1	1	1840	seed_user_10_1762431875974@example.com	José Gabriel	127.0.0.1	Téllez	N/A.		A		PUBLISHED	2025-11-06 12:24:36.007		INDEPENDENCIA	{PERFORMER}	\N	\N	f	\N	\N	\N
12	Considerado el primer maestro de música del Paraguay. Virtuoso de la guitarra, también relojero y docente. Sucedió a José Gabriel Téllez en la dirección de la escuela en 1843.	1	1	1800	2025-11-06 12:24:36.01	\N	\N	\N	seed_user_11_1762431875974@example.com	Antonio María Quintana (Luis María	127.0.0.1	Quintana)	Se le atribuye la música del himno de la Academia Literaria. Atribuida la música del Himno Patriótico (de Anastasio Rolón).		A		PUBLISHED	2025-11-06 12:24:36.01		INDETERMINADO	{PERFORMER,CONDUCTOR}	\N	\N	f	\N	\N	\N
13	Nacido en Carapeguá. Uno de los más hábiles intérpretes de la guitarra y cantor popular posterior a la Independencia (1811). Formó parte de la banda de músicos del Batallón Escolta.	1	1	1800	2025-11-06 12:24:36.012	\N	\N	\N	seed_user_12_1762431875974@example.com	Kangüe Herreros (Cangué	127.0.0.1	Herreros)	Se le atribuye la creación de la polca 'Campamento Cerro León' y la canción 'Che lucero aguai’y'.		A		PUBLISHED	2025-11-06 12:24:36.012		INDETERMINADO	{PERFORMER}	\N	\N	f	\N	\N	\N
14	Destacado guitarrista popular de la zona de Luque, hacia 1830.	1	1	1800	2025-11-06 12:24:36.014	\N	\N	\N	seed_user_13_1762431875974@example.com	Rufino	127.0.0.1	López	N/A.		A		PUBLISHED	2025-11-06 12:24:36.014		INDETERMINADO	{PERFORMER}	\N	\N	f	\N	\N	\N
15	Guitarrista popular de gran fama, en la zona de San Pedro, hacia 1830.	1	1	1800	2025-11-06 12:24:36.016	\N	\N	\N	seed_user_14_1762431875974@example.com	Ulpiano	127.0.0.1	López	N/A.		A		PUBLISHED	2025-11-06 12:24:36.016		INDETERMINADO	{PERFORMER}	\N	\N	f	\N	\N	\N
16	Guitarrista virtuoso de la zona de Carapeguá, destacado en las décadas de 1830 y 1840.	1	1	1800	2025-11-06 12:24:36.018	\N	\N	\N	seed_user_15_1762431875974@example.com	Tomás Miranda (Tomás	127.0.0.1	Carapeguá)	N/A.		A		PUBLISHED	2025-11-06 12:24:36.018		INDETERMINADO	{PERFORMER}	\N	\N	f	\N	\N	\N
17	Nació en Caraguatay. Es autor del primer Himno Patriótico del Paraguay, con letra original en guaraní, escrito hacia 1830.	1	1	1800	2025-11-06 12:24:36.02	\N	\N	\N	seed_user_16_1762431875974@example.com	Anastasio	127.0.0.1	Rolón	Primer Himno Patriótico del Paraguay (Tetã Purahéi).		A		PUBLISHED	2025-11-06 12:24:36.02		INDETERMINADO	{PERFORMER,POET}	\N	\N	f	\N	\N	\N
18	Maestro francés contratado en 1853 por C. A. López como Jefe de Música. Formó más de 20 agrupaciones musicales y fue maestro de los primeros músicos profesionales. Carácter despótico y rigurosa disciplina.	1	1	1813	2025-11-06 12:24:36.021	1	1	1861	seed_user_17_1762431875974@example.com	Francisco Sauvageot de	127.0.0.1	Dupuis	Presunto autor de la música del Himno Nacional del Paraguay y autor de una 'Marcha al Mariscal López'.		A		PUBLISHED	2025-11-06 12:24:36.021		INDEPENDENCIA	{COMPOSER,CONDUCTOR}	\N	\N	f	\N	\N	\N
19	Uno de los primeros músicos profesionales, discípulo de Dupuis. Integró orquestas en Buenos Aires tras ser prisionero en la Guerra de la Triple Alianza. Organizó la primera Orquesta Nacional subvencionada por el Estado en 1890.	1	1	1853	2025-11-06 12:24:36.024	1	1	1908	seed_user_18_1762431875974@example.com	Cantalicio	127.0.0.1	Guerrero	La paraguaya (habanera sinfónica), una Mazurca, y 'Canción guerrera' (1865). Realizó una transcripción del Himno Nacional.		A		PUBLISHED	2025-11-06 12:24:36.024		INDEPENDENCIA	{COMPOSER,PERFORMER,CONDUCTOR,ENSEMBLE_ORCHESTRA}	\N	\N	f	\N	\N	\N
20	Virtuoso de la trompeta a mediados del siglo XIX. Integraba la Banda de Músicos de la Capital hacia 1850.	1	1	1800	2025-11-06 12:24:36.026	\N	\N	\N	seed_user_19_1762431875974@example.com	Rudecindo	127.0.0.1	Morales	N/A.		A		PUBLISHED	2025-11-06 12:24:36.026		INDETERMINADO	{PERFORMER}	\N	\N	f	\N	\N	\N
21	Discípulo de Dupuis. Figura relevante en las décadas de 1850 al 60. Dirigió las primeras orquestas en la capital. Falleció en Humaitá en el frente de batalla, dirigiendo la banda militar durante un bombardeo.	1	1	1830	2025-11-06 12:24:36.029	1	1	1865	seed_user_20_1762431875974@example.com	Indalecio	127.0.0.1	Odriozola	N/A.		A		PUBLISHED	2025-11-06 12:24:36.029		INDEPENDENCIA	{CONDUCTOR,ENSEMBLE_ORCHESTRA}	\N	\N	f	\N	\N	\N
22	Poeta uruguayo, autor del Himno Nacional del Uruguay. Creó el texto del actual Himno Nacional Paraguayo, entregado en 1840.	1	1	1800	2025-11-06 12:24:36.031	\N	\N	\N	seed_user_21_1762431875974@example.com	Francisco Acuña de	127.0.0.1	Figueroa	Texto del Himno Nacional Paraguayo; Himno Nacional del Uruguay.		A		PUBLISHED	2025-11-06 12:24:36.031		INDETERMINADO	{POET}	\N	\N	f	\N	\N	\N
23	Músico húngaro radicado en el Uruguay. Figura entre los presuntos autores de la música del Himno Nacional Paraguayo.	1	1	1800	2025-11-06 12:24:36.034	\N	\N	\N	seed_user_22_1762431875974@example.com	Francisco José	127.0.0.1	Debali	Autor del Himno de Uruguay.		A		PUBLISHED	2025-11-06 12:24:36.034		INDETERMINADO	{COMPOSER}	\N	\N	f	\N	\N	\N
24	Músico italiano. Figura entre los presuntos autores de la música del Himno Nacional Paraguayo.	1	1	1800	2025-11-06 12:24:36.037	\N	\N	\N	seed_user_23_1762431875974@example.com	José	127.0.0.1	Giuffra	N/A.		A		PUBLISHED	2025-11-06 12:24:36.037		INDETERMINADO	{COMPOSER}	\N	\N	f	\N	\N	\N
25	Músico italiano que llegó a Paraguay en 1874.	1	1	1800	2025-11-06 12:24:36.04	\N	\N	\N	seed_user_24_1762431875974@example.com	Luis	127.0.0.1	Cavedagni	Realizó la primera reconstrucción del Himno Nacional, publicada en su 'Álbum de los Toques más Populares del Paraguay' (1874).		A		PUBLISHED	2025-11-06 12:24:36.04		INDETERMINADO	{PERFORMER}	\N	\N	f	\N	\N	\N
26	Maestro de Agustín Pío Barrios Mangoré. Dirigió la orquesta que acompañó a Mangoré en 1908. Co-fundador de la zarzuela paraguaya con la obra 'Tierra Guaraní' (1913). Dirigió la Banda de la Policía de la Capital.	1	1	1800	2025-11-06 12:24:36.043	\N	\N	\N	seed_user_25_1762431875974@example.com	Nicolino	127.0.0.1	Pellegrini	Tierra Guaraní (zarzuela, 1913). Versión del Himno Nacional (1922).		A		PUBLISHED	2025-11-06 12:24:36.043		INDETERMINADO	{COMPOSER,CONDUCTOR}	\N	\N	f	\N	\N	\N
27	El más universal de los músicos paraguayos. Estudió con Sosa Escalada y Nicolino Pellegrini. Realizó extensas giras por América y Europa. Desarrolló tres estilos: barroco, romántico y folklórico hispanoamericano. Considerado genio nacional en El Salvador.	1	1	1885	2025-11-06 12:24:36.045	1	1	1944	seed_user_26_1762431875974@example.com	Agustín Pío Barrios	127.0.0.1	Mangoré	'Las Abejas', 'Danza Paraguaya', 'Estudio de Concierto', 'Mazurca, Apasionata', 'La Catedral', 'Valses 3 y 4', 'Choro de Saudade' (1929), 'Julia Florida' (1938), 'Una limosna por amor de Dios', 'Kyguá Verá'.		A		PUBLISHED	2025-11-06 12:24:36.045		POSGUERRA	{COMPOSER,PERFORMER}	\N	\N	f	\N	\N	\N
28	La figura más importante de la música popular paraguaya del siglo XX. Creó la 'Guarania' en 1925. Fue un pionero en la búsqueda de un lenguaje nacional en el campo sinfónico.	1	1	1904	2025-11-06 12:24:36.047	1	1	1972	seed_user_27_1762431875974@example.com	José Asunción	127.0.0.1	Flores	Guaranias: 'Jejuí' (la primera), 'India', 'Kerasy', 'Ne rendápe aju', 'Panambí verá', 'Ñemity'. Poemas Sinfónicos: 'Mburikaó', 'Pyhare Pyte' (1954), 'Ñanderuvusu' (1957), 'María de la Paz' (1961).		A		PUBLISHED	2025-11-06 12:24:36.047		POSGUERRA	{COMPOSER}	\N	\N	f	\N	\N	\N
29	Dirigió la orquesta del Comando del Ejército durante la Guerra del Chaco. Incursionó en la composición sinfónica y creó música para filmes argentinos. Su música 'Cerro Corá' fue declarada Canción Nacional en 1944.	1	1	1905	2025-11-06 12:24:36.05	1	1	1991	seed_user_28_1762431875974@example.com	Herminio	127.0.0.1	Giménez	Obras sinfónicas: 'El Rabelero' (1944), 'Suite El Pájaro' (1950), 'Sinfonía en Gris Mayor' (1990). Populares: 'El canto de mi selva', 'Che Trompo arasá', 'Cerro Corá' (1931), 'Cerro Porteño' (1936).		A		PUBLISHED	2025-11-06 12:24:36.05		POSGUERRA	{COMPOSER,CONDUCTOR}	\N	\N	f	\N	\N	\N
30	Músico de más alta formación académica del Paraguay, estudió becado en Brasil. Creó la Orquesta Sinfónica de la Asociación de Músicos del Paraguay (1951).	1	1	1914	2025-11-06 12:24:36.054	1	1	1987	seed_user_29_1762431875974@example.com	Carlos Lara	127.0.0.1	Bareiro	Obras sinfónicas: 'Suite Paraguaya Nº 1 y 2', 'Concierto para piano y orquesta', 'Gran Guarania en Do mayor', 'Guarania Sinfónica'. Para piano: 'Acuarelas Paraguayas'.		A		PUBLISHED	2025-11-06 12:24:36.054		POSGUERRA	{COMPOSER,CONDUCTOR}	\N	\N	f	\N	\N	\N
31	Estudió en la Banda de Músicos de los Salesianos y formó su gran orquesta típica. Se estableció en Venezuela (1952) como músico y docente.	1	1	1910	2025-11-06 12:24:36.058	1	1	1969	seed_user_30_1762431875974@example.com	Emilio	127.0.0.1	Biggi	Poema sinfónico 'Renacer Guaraní' (1957). 'Cuarteto de cuerdas' (1953), 'Aire Nacional Op.3' (1953). Populares: 'Paraguay', 'Mimby pú', 'Acosta ñu', 'Cordión jahe’o'.		A		PUBLISHED	2025-11-06 12:24:36.058		POSGUERRA	{COMPOSER,PERFORMER}	\N	\N	f	\N	\N	\N
32	Se graduó de Doctor en Medicina en Buenos Aires. Pionero en musicología y rescate de música indígena. Autor de importantes estudios y libros como 'Música y músicos del Paraguay'.	1	1	1899	2025-11-06 12:24:36.061	1	1	1958	seed_user_31_1762431875974@example.com	Juan Max	127.0.0.1	Boettner	'Suite guaraní' (orquesta), 'Sinfonía en Mi menor', Ballet 'El sueño de René'. Canciones: 'Azul luna', 'Nostalgia guaraní'.		A		PUBLISHED	2025-11-06 12:24:36.061		POSGUERRA	{COMPOSER}	\N	\N	f	\N	\N	\N
33	Superó un accidente en la niñez que le costó ambas piernas. Estudió becado en Brasil. Junto a Manuel Frutos Pane, creó el género de la 'Zarzuela Paraguaya' (1956). Director del Conservatorio Municipal de Música.	1	1	1916	2025-11-06 12:24:36.065	1	1	1983	seed_user_32_1762431875974@example.com	Juan Carlos Moreno	127.0.0.1	González	Zarzuelas: 'La tejedora de Ñandutí' (1956), 'Corochire' (1958), 'María Pacuri' (1959). Sinfónico: Poema 'Kuarahy mimby' (1944). Canciones: 'Margarita' (1929).		A		PUBLISHED	2025-11-06 12:24:36.065		POSGUERRA	{COMPOSER,CONDUCTOR}	\N	\N	f	\N	\N	\N
34	Estudió en Argentina y se perfeccionó en París y Berlín. Reconstruyó la versión oficial del Himno Nacional Paraguayo (1934). Fundó la Escuela Normal de Música (1940) y la Orquesta Sinfónica de la Ciudad de Asunción (OSCA) (1957).	1	1	1898	2025-11-06 12:24:36.069	1	1	1977	seed_user_33_1762431875974@example.com	Remberto	127.0.0.1	Giménez	'Rapsodia Paraguaya' (1932 y 1954). 'Nostalgias del Terruño', 'Ka´aguy Ryakuä', 'Marcha Presidencial' (1938). 'Himno a la Juventud'.		A		PUBLISHED	2025-11-06 12:24:36.069		POSGUERRA	{COMPOSER,CONDUCTOR}	\N	\N	f	\N	\N	\N
35	Hábil ejecutante del bandoneón. Formó su propia Orquesta Típica (1925) y dirigió la Orquesta Gigante de la Asociación de Músicos del Paraguay (1938). Fundador y docente de la Escuela de Música de APA.	1	1	1905	2025-11-06 12:24:36.071	1	1	1985	seed_user_34_1762431875975@example.com	Luis	127.0.0.1	Cañete	'Jahe´o soro' (canción, 1925), 'Sueño de Artista' (poema sinfónico, 1938), 'Divertimento para cuerdas' (1938), 'Patria mía' (poema sinfónico, 1952), 'Asunción de antaño' (poema sinfónico, 1953).		A		PUBLISHED	2025-11-06 12:24:36.071		POSGUERRA	{COMPOSER,PERFORMER}	\N	\N	f	\N	\N	\N
36	Director de la OSCA (1976-1990) y director invitado en varios países. Fundó el Conservatorio Nacional de Música (1997). Autor de la primera ópera paraguaya 'Juana de Lara'. Recibió el Premio Nacional de Música en 2001.	1	1	1925	2025-11-06 12:24:36.074	\N	\N	\N	seed_user_35_1762431875975@example.com	Florentín	127.0.0.1	Giménez	Ópera 'Juana de Lara' (1987). 6 Sinfonías (1980-1994). Poemas sinfónicos: 'Minas Cué' (1970), 'El Río de la Esperanza' (1972). Comedia musical 'Sombrero piri'. Canción 'Así Canta mi Patria'.		A		PUBLISHED	2025-11-06 12:24:36.074		MODERNO	{COMPOSER,CONDUCTOR}	\N	\N	f	\N	\N	\N
37	Se dedicó fundamentalmente a la composición de música de inspiración folklórica. Integró el dúo Martínez-Cardozo con Eladio Martínez. Estudió folklore con Juan Alfonso Carrizo. Fundador de SADAIC (Argentina). Autor del libro 'Mundo Folklórico Paraguayo'.	1	1	1907	2025-11-06 12:24:36.075	1	1	1982	seed_user_36_1762431875975@example.com	Mauricio Cardozo	127.0.0.1	Ocampo	Alrededor de 300 canciones. 'Las siete cabrillas', 'Pueblo Ybycuí', 'Añoranza', 'Paraguaya linda', 'Guavirá poty', 'Galopera'.		A		PUBLISHED	2025-11-06 12:24:36.075		POSGUERRA	{COMPOSER,PERFORMER}	\N	\N	f	\N	\N	\N
38	Se radicó en Buenos Aires, participando activamente en la Agrupación Folklórica Guaraní. Estudió armonía y composición con Gilardo Gilardi. Fue director de la orquesta de la Agrupación Folklórica Guaraní.	1	1	1903	2025-11-06 12:24:36.077	1	1	1957	seed_user_37_1762431875975@example.com	Francisco Alvarenga	127.0.0.1	(Nenin)	'Carne de cañón', 'Chokokue purahéi', 'Meditación', versión sinfónica de 'Campamento Cerro León', 'Plata yvyguy'.		A		PUBLISHED	2025-11-06 12:24:36.077		POSGUERRA	{COMPOSER,CONDUCTOR}	\N	\N	f	\N	\N	\N
39	Inició su carrera junto a Herminio Giménez. Integró el célebre Trío Olímpico (1948) con Eladio Martínez y Albino Quiñonez. Su canción 'Mi dicha lejana' le dio gran popularidad.	1	1	1917	2025-11-06 12:24:36.08	1	1	1993	seed_user_38_1762431875975@example.com	Emigdio Ayala	127.0.0.1	Báez	'Polca del Club Sol de América', 'Mi dicha lejana', 'Lejana flor', 'Oración a mi amada' (co-autoría), 'A mi pueblito Escobar'.		A		PUBLISHED	2025-11-06 12:24:36.08		POSGUERRA	{COMPOSER,PERFORMER}	\N	\N	f	\N	\N	\N
40	Se estableció en Buenos Aires, siendo solista de orquestas importantes. Participó en la grabación del primer disco de José Asunción Flores (1934). Obtuvo el Premio Nacional de Música por 'Mi patria soñada' (1997).	1	1	1913	2025-11-06 12:24:36.083	1	1	1997	seed_user_39_1762431875975@example.com	Agustín	127.0.0.1	Barboza	'Alma Vibrante', 'Flor de Pilar', 'Mi patria soñada', 'Sobre el corazón de mi guitarra', 'Dulce tierra mía' (con A. Roa Bastos), 'Reservista purahéi' (con F. Fernández).		A		PUBLISHED	2025-11-06 12:24:36.083		POSGUERRA	{COMPOSER,PERFORMER}	\N	\N	f	\N	\N	\N
41	Estudió en la Banda de Músicos del Colegio Salesiano. Creó la orquesta 'Los Caballeros del Ritmo'. Desarrolló una importante labor en la creación de zarzuelas paraguayas a partir de 1960.	1	1	1923	2025-11-06 12:24:36.085	\N	\N	\N	seed_user_40_1762431875975@example.com	Neneco Norton (Elio Ramón Benítez	127.0.0.1	González)	Posee 84 composiciones. Polca 'Paloma Blanca' (difusión mundial). Guaranias: 'Aquel ayer', 'Resedá'. Zarzuelas: 'El arribeño', 'Ribereña', 'Naranjera'.		A		PUBLISHED	2025-11-06 12:24:36.085		MODERNO	{COMPOSER,PERFORMER,CONDUCTOR}	\N	\N	f	\N	\N	\N
42	Ganó el Primer Premio en el Concurso Nacional de Canto (1930). Formó el célebre dúo Martínez-Cardozo. Dirigió programas radiales de música paraguaya en Argentina. Integró el Trío Olímpico. Musicalizó la película 'El trueno entre las hojas'.	1	1	1912	2025-11-06 12:24:36.088	1	1	1990	seed_user_41_1762431875975@example.com	Eladio	127.0.0.1	Martínez	'Lucerito alba', 'Noches guaireñas', 'Che pycasumi', 'Pacholí' (zarzuela). Co-autor de 'Oración a mi amada' y 'Lejana flor'.		A		PUBLISHED	2025-11-06 12:24:36.088		POSGUERRA	{COMPOSER,PERFORMER}	\N	\N	f	\N	\N	\N
43	Formó el Trío Asunceno (1943) con Ignacio Melgarejo y Digno García. Se hizo famoso internacionalmente con su canción 'Mis noches sin ti', dedicada a su madre recién fallecida.	1	1	1916	2025-11-06 12:24:36.09	1	1	1975	seed_user_42_1762431875975@example.com	Demetrio	127.0.0.1	Ortíz	'Recuerdos de Ypacaraí', 'Mis noches sin ti', 'Que será de ti', 'Mi canción viajera'.		A		PUBLISHED	2025-11-06 12:24:36.09		POSGUERRA	{COMPOSER,PERFORMER}	\N	\N	f	\N	\N	\N
44	Figura más relevante en la interpretación y desarrollo técnico del arpa paraguaya. Inició su carrera como autodidacta. Amplió los recursos técnicos del arpa y aumentó el número de cuerdas. Su pueblo natal lleva su nombre actualmente.	1	1	1908	2025-11-06 12:24:36.094	1	1	1952	seed_user_43_1762431875975@example.com	Félix Pérez	127.0.0.1	Cardozo	Versión de la polca 'Guyra Campana' (Pájaro campana, recopilación). 'Llegada', 'Tren lechero', 'Che valle mi Yaguarón', 'Los sesenta granaderos', 'Oda pasional'.		A		PUBLISHED	2025-11-06 12:24:36.094		POSGUERRA	{COMPOSER,PERFORMER}	\N	\N	f	\N	\N	\N
45	Estudió en Brasil. Creador del género 'Avanzada' (1977), que fusiona guarania y polca con ritmos modernos e instrumentos electrónicos.	1	1	1943	2025-11-06 12:24:36.096	\N	\N	\N	seed_user_44_1762431875975@example.com	Oscar Nelson	127.0.0.1	Safuán	'Tema paraguayo' (1977), 'Avanzada', 'Paraguay 80', 'Nacionales 1, 2 y 3'.		A		PUBLISHED	2025-11-06 12:24:36.096		MODERNO	{COMPOSER}	\N	\N	f	\N	\N	\N
46	Formó parte del movimiento del Nuevo Cancionero Latinoamericano en Paraguay. Destacado por sus textos de aguda visión, ironía y compromiso social. Fue periodista y profesor de música.	1	1	1945	2025-11-06 12:24:36.099	1	1	1980	seed_user_45_1762431875975@example.com	Maneco Galeano (Félix Roberto	127.0.0.1	Galeano)	'Yo soy de la Chacarita' (1971), 'Despertar' (1973), 'La Chuchi' (1970), 'Los problemas que acarrea un televisor...', 'Poncho de 60 listas' (1980), 'Ceferino Zarza compañero' (con Jorge Garbett).		A		PUBLISHED	2025-11-06 12:24:36.099		MODERNO	{COMPOSER}	\N	\N	f	\N	\N	\N
47	Compositor que creó varias composiciones dentro del género 'Avanzada'.	1	1	1800	2025-11-06 12:24:36.102	\N	\N	\N	seed_user_46_1762431875975@example.com	Papi	127.0.0.1	Galán	Composiciones en género Avanzada.		A		PUBLISHED	2025-11-06 12:24:36.102		INDETERMINADO	{COMPOSER}	\N	\N	f	\N	\N	\N
48	Compositor que creó varias composiciones dentro del género 'Avanzada'.	1	1	1800	2025-11-06 12:24:36.104	\N	\N	\N	seed_user_47_1762431875975@example.com	Vicente	127.0.0.1	Castillo	Composiciones en género Avanzada.		A		PUBLISHED	2025-11-06 12:24:36.104		INDETERMINADO	{COMPOSER}	\N	\N	f	\N	\N	\N
49	Compositor que creó varias composiciones dentro del género 'Avanzada'.	1	1	1800	2025-11-06 12:24:36.106	\N	\N	\N	seed_user_48_1762431875975@example.com	Luis	127.0.0.1	Bordón	Composiciones en género Avanzada.		A		PUBLISHED	2025-11-06 12:24:36.106		INDETERMINADO	{COMPOSER}	\N	\N	f	\N	\N	\N
50	Representante destacado del movimiento del Nuevo Cancionero en Paraguay.	1	1	1800	2025-11-06 12:24:36.108	\N	\N	\N	seed_user_49_1762431875975@example.com	Carlos	127.0.0.1	Noguera	'Canto de esperanza', 'A la residenta', 'Hazme un sitio a tu lado', 'El silencio y la aurora'.		A		PUBLISHED	2025-11-06 12:24:36.108		INDETERMINADO	{COMPOSER}	\N	\N	f	\N	\N	\N
51	Representante destacado del movimiento del Nuevo Cancionero en Paraguay.	1	1	1800	2025-11-06 12:24:36.11	\N	\N	\N	seed_user_50_1762431875975@example.com	Jorge	127.0.0.1	Garbett	'Ceferino Zarza compañero' (con Maneco Galeano), 'Los hombres' (marcha), 'Para vivir'.		A		PUBLISHED	2025-11-06 12:24:36.11		INDETERMINADO	{COMPOSER}	\N	\N	f	\N	\N	\N
52	Representante destacado e intérprete del movimiento del Nuevo Cancionero.	1	1	1800	2025-11-06 12:24:36.111	\N	\N	\N	seed_user_51_1762431875975@example.com	Alberto	127.0.0.1	Rodas	'Torres de babel', 'Sudor de pobre', 'Tenemos tanto', 'Mundo loco'.		A		PUBLISHED	2025-11-06 12:24:36.111		INDETERMINADO	{COMPOSER}	\N	\N	f	\N	\N	\N
53	Representante destacado del movimiento del Nuevo Cancionero en Paraguay.	1	1	1800	2025-11-06 12:24:36.113	\N	\N	\N	seed_user_52_1762431875975@example.com	Rolando	127.0.0.1	Chaparro	'Polcaza', 'Polcarera de los lobos', 'Un misil en mi ventana', 'Ojavea'.		A		PUBLISHED	2025-11-06 12:24:36.113		INDETERMINADO	{COMPOSER}	\N	\N	f	\N	\N	\N
\.


--
-- Data for Name: CostoCatedra; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."CostoCatedra" (id, "catedraId", monto_matricula, monto_cuota, es_gratuita, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: DiaClase; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."DiaClase" (id, fecha, dia_semana, created_at, updated_at, "catedraId") FROM stdin;
\.


--
-- Data for Name: Docente; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."Docente" (id, nombre, apellido, email, "otpSecret", "otpEnabled", created_at, updated_at, direccion, telefono) FROM stdin;
1	Julio	Franco	jucfra23@gmail.com	GRTWCWTLEEYWWKDBKRIUMNLLONCVOYZS	t	2025-11-06 12:24:35.843	2025-11-06 20:33:05.5	Laurelty 4565, Luque - Paraguay	0981574711
\.


--
-- Data for Name: EditSuggestion; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."EditSuggestion" (id, first_name, last_name, birth_year, birth_month, birth_day, death_year, death_month, death_day, bio, notable_works, period, "references", youtube_link, "mainRole", reason, status, suggester_email, suggester_ip, created_at, updated_at, "composerId", is_student_contribution, student_first_name, student_last_name, points, photo_url) FROM stdin;
\.


--
-- Data for Name: Evaluacion; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."Evaluacion" (id, titulo, created_at, "catedraId", fecha_limite, "isMaster", "unidadPlanId") FROM stdin;
1	EVALUACIÓN 1ER. CUATRIMESTRE	2025-11-06 12:24:36.159	2	2025-06-30 23:59:59	t	7
2	EVALUACIÓN 1ER. CUATRIMESTRE Filosofía	2025-11-06 12:24:36.282	1	2025-06-30 23:59:59	t	24
3	Evaluación sobre el Periodo de Los López	2025-11-06 12:24:36.284	2	2025-07-15 23:59:59	t	8
4	Evaluación: El mundo del arte en el pensamiento filosófico	2025-11-06 12:24:36.31	1	2025-04-30 23:59:59	t	19
5	Evaluación: Nietzsche y la voluntad de poder como arte	2025-11-06 12:24:36.324	1	2025-07-30 23:59:59	t	26
\.


--
-- Data for Name: EvaluacionAsignacion; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."EvaluacionAsignacion" (id, estado, fecha_entrega, created_at, updated_at, "alumnoId", "evaluacionId", "publicacionId") FROM stdin;
1	CALIFICADA	2025-06-30 23:59:59	2025-11-06 12:24:36.162	2025-11-06 12:24:36.162	3	1	\N
2	CALIFICADA	2025-06-30 23:59:59	2025-11-06 12:24:36.17	2025-11-06 12:24:36.17	4	1	\N
3	CALIFICADA	2025-06-30 23:59:59	2025-11-06 12:24:36.174	2025-11-06 12:24:36.174	5	1	\N
4	CALIFICADA	2025-06-30 23:59:59	2025-11-06 12:24:36.18	2025-11-06 12:24:36.18	6	1	\N
5	CALIFICADA	2025-06-30 23:59:59	2025-11-06 12:24:36.183	2025-11-06 12:24:36.183	7	1	\N
6	CALIFICADA	2025-06-30 23:59:59	2025-11-06 12:24:36.185	2025-11-06 12:24:36.185	8	1	\N
7	CALIFICADA	2025-06-30 23:59:59	2025-11-06 12:24:36.188	2025-11-06 12:24:36.188	9	1	\N
8	CALIFICADA	2025-06-30 23:59:59	2025-11-06 12:24:36.191	2025-11-06 12:24:36.191	10	1	\N
9	CALIFICADA	2025-06-30 23:59:59	2025-11-06 12:24:36.193	2025-11-06 12:24:36.193	2	1	\N
10	CALIFICADA	2025-06-30 23:59:59	2025-11-06 12:24:36.199	2025-11-06 12:24:36.199	1	1	\N
11	CALIFICADA	2025-06-30 23:59:59	2025-11-06 12:24:36.203	2025-11-06 12:24:36.203	16	1	\N
12	CALIFICADA	2025-06-30 23:59:59	2025-11-06 12:24:36.206	2025-11-06 12:24:36.206	17	1	\N
13	CALIFICADA	2025-07-15 23:59:59	2025-11-06 12:24:36.285	2025-11-06 12:24:36.285	3	3	\N
14	CALIFICADA	2025-07-15 23:59:59	2025-11-06 12:24:36.287	2025-11-06 12:24:36.287	4	3	\N
15	CALIFICADA	2025-07-15 23:59:59	2025-11-06 12:24:36.289	2025-11-06 12:24:36.289	5	3	\N
16	CALIFICADA	2025-07-15 23:59:59	2025-11-06 12:24:36.291	2025-11-06 12:24:36.291	6	3	\N
17	CALIFICADA	2025-07-15 23:59:59	2025-11-06 12:24:36.293	2025-11-06 12:24:36.293	7	3	\N
18	CALIFICADA	2025-07-15 23:59:59	2025-11-06 12:24:36.295	2025-11-06 12:24:36.295	8	3	\N
19	CALIFICADA	2025-07-15 23:59:59	2025-11-06 12:24:36.297	2025-11-06 12:24:36.297	9	3	\N
20	CALIFICADA	2025-07-15 23:59:59	2025-11-06 12:24:36.3	2025-11-06 12:24:36.3	10	3	\N
21	CALIFICADA	2025-07-15 23:59:59	2025-11-06 12:24:36.302	2025-11-06 12:24:36.302	2	3	\N
22	CALIFICADA	2025-07-15 23:59:59	2025-11-06 12:24:36.304	2025-11-06 12:24:36.304	1	3	\N
23	CALIFICADA	2025-07-15 23:59:59	2025-11-06 12:24:36.306	2025-11-06 12:24:36.306	16	3	\N
24	CALIFICADA	2025-07-15 23:59:59	2025-11-06 12:24:36.308	2025-11-06 12:24:36.308	17	3	\N
25	CALIFICADA	2025-04-30 23:59:59	2025-11-06 12:24:36.311	2025-11-06 12:24:36.311	11	4	\N
26	CALIFICADA	2025-04-30 23:59:59	2025-11-06 12:24:36.314	2025-11-06 12:24:36.314	12	4	\N
27	CALIFICADA	2025-04-30 23:59:59	2025-11-06 12:24:36.315	2025-11-06 12:24:36.315	13	4	\N
28	CALIFICADA	2025-04-30 23:59:59	2025-11-06 12:24:36.318	2025-11-06 12:24:36.318	14	4	\N
29	CALIFICADA	2025-04-30 23:59:59	2025-11-06 12:24:36.32	2025-11-06 12:24:36.32	15	4	\N
30	CALIFICADA	2025-07-30 23:59:59	2025-11-06 12:24:36.326	2025-11-06 12:24:36.326	11	5	\N
31	CALIFICADA	2025-07-30 23:59:59	2025-11-06 12:24:36.33	2025-11-06 12:24:36.33	12	5	\N
32	CALIFICADA	2025-07-30 23:59:59	2025-11-06 12:24:36.333	2025-11-06 12:24:36.333	13	5	\N
33	CALIFICADA	2025-07-30 23:59:59	2025-11-06 12:24:36.337	2025-11-06 12:24:36.337	14	5	\N
34	CALIFICADA	2025-07-30 23:59:59	2025-11-06 12:24:36.34	2025-11-06 12:24:36.34	15	5	\N
\.


--
-- Data for Name: Opcion; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."Opcion" (id, texto, es_correcta, "preguntaId") FROM stdin;
\.


--
-- Data for Name: Otp; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."Otp" (id, email, code, "expiresAt") FROM stdin;
2	lizvanesabritezgomez@gmail.com	113573	2025-11-06 15:34:08.164
\.


--
-- Data for Name: Pago; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."Pago" (id, "catedraAlumnoId", fecha_pago, monto_pagado, tipo_pago, periodo_cubierto, "confirmadoPorId", created_at) FROM stdin;
\.


--
-- Data for Name: PlanDeClases; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."PlanDeClases" (id, titulo, "tipoOrganizacion", "docenteId", "catedraId", created_at, updated_at) FROM stdin;
1	PLAN ANUAL DE ESTUDIOS 2025 - Historia de la Música del Paraguay	MES	1	2	2025-11-06 12:24:36.115	2025-11-06 12:24:36.115
2	PLAN ANUAL DE ESTUDIOS 2025 - Introducción a la Filosofía	MES	1	1	2025-11-06 12:24:36.256	2025-11-06 12:24:36.256
\.


--
-- Data for Name: Pregunta; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."Pregunta" (id, texto, "evaluacionId") FROM stdin;
\.


--
-- Data for Name: Publicacion; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."Publicacion" (id, titulo, contenido, tipo, "catedraId", "autorAlumnoId", "autorDocenteId", created_at, updated_at, "tareaMaestraId", "visibleToStudents", "evaluacionAsignacionId", "evaluacionMaestraId") FROM stdin;
1	Nueva Tarea: Reflexión Personal sobre Filosofía y Música. 	\n      <p>Se ha creado una nueva tarea: <strong>Reflexión Personal sobre Filosofía y Música. </strong>.</p>\n      <p><strong>Descripción:</strong> <ul><li><strong>Escribe a mano</strong> en cualquier hoja sobre lo que has aprendido en la cátedra, enfocado en la música. </li><li><strong>Reflexiona sobre los siguientes aspectos:</strong></li><li class="ql-indent-1">Haz un recorrido por los autores que más te llamaron la atención, intentando incluir en ella los asuntos relacionados a la filosofia, la belleza, el arte, la música. </li><li class="ql-indent-1">Puedes usar todo lo que esté a tu alcance, pero más valoro si lo que escirbes sale de tu reflexíon interna, apoyando en los conceptos que hemos trabajao en clases, desde Sócrates a los pensadores más recientes. Puedes apelar a la linea de tiempo que usamos en clase. </li></ul><h3><strong>Entrega</strong></h3><ul><li><strong>Formato</strong>: A mano, en cualquier hoja. Intenta ser lo más pulcro posible y con una caligrafia legible.</li><li><strong>Subida</strong>: Toma una foto de tu trabajo y súbela a la plataforma.</li></ul><p><br></p>.</p>\n      <p><strong>Fecha de Entrega:</strong> 6 de diciembre de 2025.</p>\n          	TAREA	1	\N	1	2025-11-06 12:43:39.09	2025-11-06 12:43:39.09	5	f	\N	\N
2	Nueva Tarea: Reflexión personal sobre un autor paraguayo que más te inspiró.	\n      <p>Se ha creado una nueva tarea: <strong>Reflexión personal sobre un autor paraguayo que más te inspiró.</strong>.</p>\n      <p><strong>Descripción:</strong> <p>Escribe en una hoja, a mano, tus pensamientos y emociones sobre cómo este autor influyó en tu vida o en tu forma de pensar. Sé sincero y profundo en tus palabras, destacando las obras, frases o ideas que más resonaron contigo.</p>.</p>\n      <p><strong>Fecha de Entrega:</strong> 7 de noviembre de 2025.</p>\n          	TAREA	2	\N	1	2025-11-06 21:07:41.891	2025-11-06 21:07:41.891	6	f	\N	\N
\.


--
-- Data for Name: PublicacionInteraccion; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."PublicacionInteraccion" (id, "publicacionId", "alumnoId", "docenteId", tipo, created_at) FROM stdin;
\.


--
-- Data for Name: Puntuacion; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."Puntuacion" (id, puntos, motivo, created_at, "alumnoId", "catedraId", tipo) FROM stdin;
1	20	Tarea: Tarea: Prejuicios Estéticos y Análisis Morfológico	2025-11-06 12:24:36.367	3	2	TAREA
2	20	Tarea: Tarea: Prejuicios Estéticos y Análisis Morfológico	2025-11-06 12:24:36.37	4	2	TAREA
3	20	Tarea: Tarea: Prejuicios Estéticos y Análisis Morfológico	2025-11-06 12:24:36.372	5	2	TAREA
4	20	Tarea: Tarea: Prejuicios Estéticos y Análisis Morfológico	2025-11-06 12:24:36.373	6	2	TAREA
5	20	Tarea: Tarea: Prejuicios Estéticos y Análisis Morfológico	2025-11-06 12:24:36.374	7	2	TAREA
6	20	Tarea: Tarea: Prejuicios Estéticos y Análisis Morfológico	2025-11-06 12:24:36.375	8	2	TAREA
7	20	Tarea: Tarea: Prejuicios Estéticos y Análisis Morfológico	2025-11-06 12:24:36.376	9	2	TAREA
8	20	Tarea: Tarea: Prejuicios Estéticos y Análisis Morfológico	2025-11-06 12:24:36.378	10	2	TAREA
9	20	Tarea: Tarea: Prejuicios Estéticos y Análisis Morfológico	2025-11-06 12:24:36.38	2	2	TAREA
10	20	Tarea: Tarea: Prejuicios Estéticos y Análisis Morfológico	2025-11-06 12:24:36.382	1	2	TAREA
11	20	Tarea: Tarea: Prejuicios Estéticos y Análisis Morfológico	2025-11-06 12:24:36.383	16	2	TAREA
12	20	Tarea: Tarea: Prejuicios Estéticos y Análisis Morfológico	2025-11-06 12:24:36.384	17	2	TAREA
13	20	Tarea: Tarea: Instrumentos Musicales Indígenas	2025-11-06 12:24:36.385	3	2	TAREA
14	20	Tarea: Tarea: Instrumentos Musicales Indígenas	2025-11-06 12:24:36.387	4	2	TAREA
15	20	Tarea: Tarea: Instrumentos Musicales Indígenas	2025-11-06 12:24:36.388	5	2	TAREA
16	20	Tarea: Tarea: Instrumentos Musicales Indígenas	2025-11-06 12:24:36.389	6	2	TAREA
17	20	Tarea: Tarea: Instrumentos Musicales Indígenas	2025-11-06 12:24:36.39	7	2	TAREA
18	20	Tarea: Tarea: Instrumentos Musicales Indígenas	2025-11-06 12:24:36.391	8	2	TAREA
19	20	Tarea: Tarea: Instrumentos Musicales Indígenas	2025-11-06 12:24:36.392	9	2	TAREA
20	20	Tarea: Tarea: Instrumentos Musicales Indígenas	2025-11-06 12:24:36.393	10	2	TAREA
21	20	Tarea: Tarea: Instrumentos Musicales Indígenas	2025-11-06 12:24:36.394	2	2	TAREA
22	20	Tarea: Tarea: Instrumentos Musicales Indígenas	2025-11-06 12:24:36.395	1	2	TAREA
23	20	Tarea: Tarea: Instrumentos Musicales Indígenas	2025-11-06 12:24:36.396	16	2	TAREA
24	20	Tarea: Tarea: Instrumentos Musicales Indígenas	2025-11-06 12:24:36.397	17	2	TAREA
25	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE	2025-11-06 12:24:36.399	3	2	EVALUACION
26	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE	2025-11-06 12:24:36.4	4	2	EVALUACION
27	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE	2025-11-06 12:24:36.401	5	2	EVALUACION
28	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE	2025-11-06 12:24:36.402	6	2	EVALUACION
29	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE	2025-11-06 12:24:36.402	7	2	EVALUACION
30	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE	2025-11-06 12:24:36.403	8	2	EVALUACION
31	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE	2025-11-06 12:24:36.404	9	2	EVALUACION
32	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE	2025-11-06 12:24:36.405	10	2	EVALUACION
33	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE	2025-11-06 12:24:36.406	2	2	EVALUACION
34	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE	2025-11-06 12:24:36.407	1	2	EVALUACION
35	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE	2025-11-06 12:24:36.408	16	2	EVALUACION
36	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE	2025-11-06 12:24:36.409	17	2	EVALUACION
37	20	Evaluación: Evaluación sobre el Periodo de Los López	2025-11-06 12:24:36.41	3	2	EVALUACION
38	20	Evaluación: Evaluación sobre el Periodo de Los López	2025-11-06 12:24:36.411	4	2	EVALUACION
39	20	Evaluación: Evaluación sobre el Periodo de Los López	2025-11-06 12:24:36.412	5	2	EVALUACION
40	20	Evaluación: Evaluación sobre el Periodo de Los López	2025-11-06 12:24:36.413	6	2	EVALUACION
41	20	Evaluación: Evaluación sobre el Periodo de Los López	2025-11-06 12:24:36.414	7	2	EVALUACION
42	20	Evaluación: Evaluación sobre el Periodo de Los López	2025-11-06 12:24:36.415	8	2	EVALUACION
43	20	Evaluación: Evaluación sobre el Periodo de Los López	2025-11-06 12:24:36.416	9	2	EVALUACION
44	20	Evaluación: Evaluación sobre el Periodo de Los López	2025-11-06 12:24:36.417	10	2	EVALUACION
45	20	Evaluación: Evaluación sobre el Periodo de Los López	2025-11-06 12:24:36.418	2	2	EVALUACION
46	20	Evaluación: Evaluación sobre el Periodo de Los López	2025-11-06 12:24:36.419	1	2	EVALUACION
47	20	Evaluación: Evaluación sobre el Periodo de Los López	2025-11-06 12:24:36.42	16	2	EVALUACION
48	20	Evaluación: Evaluación sobre el Periodo de Los López	2025-11-06 12:24:36.421	17	2	EVALUACION
49	10	Tarea: Tarea: Contextualización Filosófica de la Estética	2025-11-06 12:24:36.423	11	1	TAREA
50	10	Tarea: Tarea: Contextualización Filosófica de la Estética	2025-11-06 12:24:36.424	12	1	TAREA
51	10	Tarea: Tarea: Contextualización Filosófica de la Estética	2025-11-06 12:24:36.426	13	1	TAREA
52	10	Tarea: Tarea: Contextualización Filosófica de la Estética	2025-11-06 12:24:36.427	14	1	TAREA
53	10	Tarea: Tarea: Contextualización Filosófica de la Estética	2025-11-06 12:24:36.429	15	1	TAREA
54	10	Tarea: Tarea: Análisis de la Filosofía Antigua del Arte	2025-11-06 12:24:36.431	11	1	TAREA
55	10	Tarea: Tarea: Análisis de la Filosofía Antigua del Arte	2025-11-06 12:24:36.433	12	1	TAREA
56	10	Tarea: Tarea: Análisis de la Filosofía Antigua del Arte	2025-11-06 12:24:36.435	13	1	TAREA
57	10	Tarea: Tarea: Análisis de la Filosofía Antigua del Arte	2025-11-06 12:24:36.436	14	1	TAREA
58	10	Tarea: Tarea: Análisis de la Filosofía Antigua del Arte	2025-11-06 12:24:36.437	15	1	TAREA
59	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE Filosofía	2025-11-06 12:24:36.44	11	1	EVALUACION
60	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE Filosofía	2025-11-06 12:24:36.442	12	1	EVALUACION
61	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE Filosofía	2025-11-06 12:24:36.443	13	1	EVALUACION
62	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE Filosofía	2025-11-06 12:24:36.445	14	1	EVALUACION
63	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE Filosofía	2025-11-06 12:24:36.448	15	1	EVALUACION
64	20	Evaluación: Evaluación: El mundo del arte en el pensamiento filosófico	2025-11-06 12:24:36.45	11	1	EVALUACION
65	20	Evaluación: Evaluación: El mundo del arte en el pensamiento filosófico	2025-11-06 12:24:36.453	12	1	EVALUACION
66	20	Evaluación: Evaluación: El mundo del arte en el pensamiento filosófico	2025-11-06 12:24:36.455	13	1	EVALUACION
67	20	Evaluación: Evaluación: El mundo del arte en el pensamiento filosófico	2025-11-06 12:24:36.457	14	1	EVALUACION
68	20	Evaluación: Evaluación: El mundo del arte en el pensamiento filosófico	2025-11-06 12:24:36.458	15	1	EVALUACION
69	20	Evaluación: Evaluación: Nietzsche y la voluntad de poder como arte	2025-11-06 12:24:36.46	11	1	EVALUACION
70	20	Evaluación: Evaluación: Nietzsche y la voluntad de poder como arte	2025-11-06 12:24:36.462	12	1	EVALUACION
71	20	Evaluación: Evaluación: Nietzsche y la voluntad de poder como arte	2025-11-06 12:24:36.464	13	1	EVALUACION
72	20	Evaluación: Evaluación: Nietzsche y la voluntad de poder como arte	2025-11-06 12:24:36.465	14	1	EVALUACION
73	20	Evaluación: Evaluación: Nietzsche y la voluntad de poder como arte	2025-11-06 12:24:36.467	15	1	EVALUACION
74	16	Calificación de tarea: Reflexión personal sobre un autor paraguayo que más te inspiró.	2025-11-06 23:46:17.422	17	2	TAREA
\.


--
-- Data for Name: Rating; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."Rating" (id, rating_value, ip_address, created_at, "composerId") FROM stdin;
\.


--
-- Data for Name: RespuestaAlumno; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."RespuestaAlumno" (id, created_at, "alumnoId", "preguntaId", "opcionElegidaId") FROM stdin;
\.


--
-- Data for Name: TareaAsignacion; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."TareaAsignacion" (id, estado, submission_path, submission_date, puntos_obtenidos, created_at, updated_at, "alumnoId", "tareaMaestraId", comentario_docente) FROM stdin;
1	CALIFICADA	\N	2025-11-06 12:24:36.21	20	2025-11-06 12:24:36.21	2025-11-06 12:24:36.21	3	1	\N
2	CALIFICADA	\N	2025-11-06 12:24:36.213	20	2025-11-06 12:24:36.213	2025-11-06 12:24:36.213	4	1	\N
3	CALIFICADA	\N	2025-11-06 12:24:36.214	20	2025-11-06 12:24:36.214	2025-11-06 12:24:36.214	5	1	\N
4	CALIFICADA	\N	2025-11-06 12:24:36.216	20	2025-11-06 12:24:36.216	2025-11-06 12:24:36.216	6	1	\N
5	CALIFICADA	\N	2025-11-06 12:24:36.217	20	2025-11-06 12:24:36.217	2025-11-06 12:24:36.217	7	1	\N
6	CALIFICADA	\N	2025-11-06 12:24:36.218	20	2025-11-06 12:24:36.218	2025-11-06 12:24:36.218	8	1	\N
7	CALIFICADA	\N	2025-11-06 12:24:36.22	20	2025-11-06 12:24:36.22	2025-11-06 12:24:36.22	9	1	\N
8	CALIFICADA	\N	2025-11-06 12:24:36.221	20	2025-11-06 12:24:36.221	2025-11-06 12:24:36.221	10	1	\N
9	CALIFICADA	\N	2025-11-06 12:24:36.222	20	2025-11-06 12:24:36.222	2025-11-06 12:24:36.222	2	1	\N
10	CALIFICADA	\N	2025-11-06 12:24:36.224	20	2025-11-06 12:24:36.224	2025-11-06 12:24:36.224	1	1	\N
11	CALIFICADA	\N	2025-11-06 12:24:36.225	20	2025-11-06 12:24:36.225	2025-11-06 12:24:36.225	16	1	\N
12	CALIFICADA	\N	2025-11-06 12:24:36.227	20	2025-11-06 12:24:36.227	2025-11-06 12:24:36.227	17	1	\N
13	CALIFICADA	\N	2025-11-06 12:24:36.232	20	2025-11-06 12:24:36.232	2025-11-06 12:24:36.232	3	2	\N
14	CALIFICADA	\N	2025-11-06 12:24:36.234	20	2025-11-06 12:24:36.234	2025-11-06 12:24:36.234	4	2	\N
15	CALIFICADA	\N	2025-11-06 12:24:36.236	20	2025-11-06 12:24:36.236	2025-11-06 12:24:36.236	5	2	\N
16	CALIFICADA	\N	2025-11-06 12:24:36.238	20	2025-11-06 12:24:36.238	2025-11-06 12:24:36.238	6	2	\N
17	CALIFICADA	\N	2025-11-06 12:24:36.24	20	2025-11-06 12:24:36.24	2025-11-06 12:24:36.24	7	2	\N
18	CALIFICADA	\N	2025-11-06 12:24:36.242	20	2025-11-06 12:24:36.242	2025-11-06 12:24:36.242	8	2	\N
19	CALIFICADA	\N	2025-11-06 12:24:36.243	20	2025-11-06 12:24:36.243	2025-11-06 12:24:36.243	9	2	\N
20	CALIFICADA	\N	2025-11-06 12:24:36.244	20	2025-11-06 12:24:36.244	2025-11-06 12:24:36.244	10	2	\N
21	CALIFICADA	\N	2025-11-06 12:24:36.247	20	2025-11-06 12:24:36.247	2025-11-06 12:24:36.247	2	2	\N
22	CALIFICADA	\N	2025-11-06 12:24:36.249	20	2025-11-06 12:24:36.249	2025-11-06 12:24:36.249	1	2	\N
23	CALIFICADA	\N	2025-11-06 12:24:36.251	20	2025-11-06 12:24:36.251	2025-11-06 12:24:36.251	16	2	\N
24	CALIFICADA	\N	2025-11-06 12:24:36.253	20	2025-11-06 12:24:36.253	2025-11-06 12:24:36.253	17	2	\N
25	ENTREGADA	\N	2025-11-06 12:24:36.346	10	2025-11-06 12:24:36.346	2025-11-06 12:24:36.346	11	3	\N
26	ENTREGADA	\N	2025-11-06 12:24:36.348	10	2025-11-06 12:24:36.348	2025-11-06 12:24:36.348	12	3	\N
27	ENTREGADA	\N	2025-11-06 12:24:36.35	10	2025-11-06 12:24:36.35	2025-11-06 12:24:36.35	13	3	\N
28	ENTREGADA	\N	2025-11-06 12:24:36.351	10	2025-11-06 12:24:36.351	2025-11-06 12:24:36.351	14	3	\N
29	ENTREGADA	\N	2025-11-06 12:24:36.353	10	2025-11-06 12:24:36.353	2025-11-06 12:24:36.353	15	3	\N
30	ENTREGADA	\N	2025-11-06 12:24:36.357	10	2025-11-06 12:24:36.357	2025-11-06 12:24:36.357	11	4	\N
31	ENTREGADA	\N	2025-11-06 12:24:36.358	10	2025-11-06 12:24:36.358	2025-11-06 12:24:36.358	12	4	\N
32	ENTREGADA	\N	2025-11-06 12:24:36.36	10	2025-11-06 12:24:36.36	2025-11-06 12:24:36.36	13	4	\N
33	ENTREGADA	\N	2025-11-06 12:24:36.361	10	2025-11-06 12:24:36.361	2025-11-06 12:24:36.361	14	4	\N
34	ENTREGADA	\N	2025-11-06 12:24:36.364	10	2025-11-06 12:24:36.364	2025-11-06 12:24:36.364	15	4	\N
35	ENTREGADA	/uploads/entregas/file-1762434722678-691945803.png	2025-11-06 13:12:02.688	\N	2025-11-06 13:01:40.466	2025-11-06 13:12:02.689	2	5	\N
36	ASIGNADA	\N	\N	\N	2025-11-06 13:20:10.367	2025-11-06 13:20:10.367	11	5	\N
37	ASIGNADA	\N	\N	\N	2025-11-06 13:20:10.541	2025-11-06 13:20:10.541	12	5	\N
38	ASIGNADA	\N	\N	\N	2025-11-06 13:20:10.762	2025-11-06 13:20:10.762	13	5	\N
39	ASIGNADA	\N	\N	\N	2025-11-06 13:20:10.913	2025-11-06 13:20:10.913	14	5	\N
40	ASIGNADA	\N	\N	\N	2025-11-06 13:20:11.047	2025-11-06 13:20:11.047	15	5	\N
41	ASIGNADA	\N	\N	\N	2025-11-06 21:07:50.796	2025-11-06 21:07:50.796	3	6	\N
42	ASIGNADA	\N	\N	\N	2025-11-06 21:07:51.181	2025-11-06 21:07:51.181	4	6	\N
43	ASIGNADA	\N	\N	\N	2025-11-06 21:07:51.32	2025-11-06 21:07:51.32	5	6	\N
44	ASIGNADA	\N	\N	\N	2025-11-06 21:07:51.509	2025-11-06 21:07:51.509	6	6	\N
45	ASIGNADA	\N	\N	\N	2025-11-06 21:07:51.64	2025-11-06 21:07:51.64	7	6	\N
46	ASIGNADA	\N	\N	\N	2025-11-06 21:07:51.769	2025-11-06 21:07:51.769	8	6	\N
47	ASIGNADA	\N	\N	\N	2025-11-06 21:07:51.894	2025-11-06 21:07:51.894	9	6	\N
48	ASIGNADA	\N	\N	\N	2025-11-06 21:07:52.017	2025-11-06 21:07:52.017	10	6	\N
49	ASIGNADA	\N	\N	\N	2025-11-06 21:07:52.143	2025-11-06 21:07:52.143	2	6	\N
50	ASIGNADA	\N	\N	\N	2025-11-06 21:07:52.279	2025-11-06 21:07:52.279	1	6	\N
51	ASIGNADA	\N	\N	\N	2025-11-06 21:07:52.396	2025-11-06 21:07:52.396	16	6	\N
52	CALIFICADA	/uploads/entregas/file-1762463624784-13398315.jpeg	2025-11-06 21:13:44.813	16	2025-11-06 21:07:52.512	2025-11-06 23:46:17.399	17	6	\N
\.


--
-- Data for Name: TareaMaestra; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."TareaMaestra" (id, titulo, descripcion, fecha_entrega, puntos_posibles, recursos, multimedia_path, created_at, updated_at, "catedraId", "publicacionId", "unidadPlanId") FROM stdin;
1	Tarea: Prejuicios Estéticos y Análisis Morfológico	Investigar y analizar dos ejemplos de prejuicios estéticos en la música, y aplicar un análisis morfológico básico a una pieza musical indígena (proporcionada en clase).	2025-04-15 23:59:59	20	{"Guía de análisis morfológico.pdf"}	\N	2025-11-06 12:24:36.208	2025-11-06 12:24:36.208	2	\N	1
2	Tarea: Instrumentos Musicales Indígenas	Realizar una investigación sobre 3 instrumentos musicales étnicos del Paraguay. Incluir descripción, origen, y uso en rituales o danzas. Presentar en formato de informe corto con imágenes.	2025-05-10 23:59:59	20	{"Lista de recursos bibliográficos.pdf"}	\N	2025-11-06 12:24:36.229	2025-11-06 12:24:36.229	2	\N	3
3	Tarea: Contextualización Filosófica de la Estética	Realizar un breve ensayo sobre la filosofía como disciplina humanística y su relación con la estética.	2025-03-30 23:59:59	10	{}	\N	2025-11-06 12:24:36.343	2025-11-06 12:24:36.343	1	\N	18
4	Tarea: Análisis de la Filosofía Antigua del Arte	Analizar un mito o tragedia griega y relacionarlo con el pensamiento filosófico de la época sobre el arte.	2025-05-10 23:59:59	10	{}	\N	2025-11-06 12:24:36.355	2025-11-06 12:24:36.355	1	\N	21
5	Reflexión Personal sobre Filosofía y Música. 	<ul><li><strong>Escribe a mano</strong> en cualquier hoja sobre lo que has aprendido en la cátedra, enfocado en la música. </li><li><strong>Reflexiona sobre los siguientes aspectos:</strong></li><li class="ql-indent-1">Haz un recorrido por los autores que más te llamaron la atención, intentando incluir en ella los asuntos relacionados a la filosofia, la belleza, el arte, la música. </li><li class="ql-indent-1">Puedes usar todo lo que esté a tu alcance, pero más valoro si lo que escirbes sale de tu reflexíon interna, apoyando en los conceptos que hemos trabajao en clases, desde Sócrates a los pensadores más recientes. Puedes apelar a la linea de tiempo que usamos en clase. </li></ul><h3><strong>Entrega</strong></h3><ul><li><strong>Formato</strong>: A mano, en cualquier hoja. Intenta ser lo más pulcro posible y con una caligrafia legible.</li><li><strong>Subida</strong>: Toma una foto de tu trabajo y súbela a la plataforma.</li></ul><p><br></p>	2025-12-06 00:00:00	20	{https://jufrancopy.github.io/intro_filosofia/}	\N	2025-11-06 12:43:38.986	2025-11-06 12:43:39.099	1	1	33
6	Reflexión personal sobre un autor paraguayo que más te inspiró.	<p>Escribe en una hoja, a mano, tus pensamientos y emociones sobre cómo este autor influyó en tu vida o en tu forma de pensar. Sé sincero y profundo en tus palabras, destacando las obras, frases o ideas que más resonaron contigo.</p>	2025-11-07 00:00:00	20	{https://hmpy.thepydeveloper.dev/}	\N	2025-11-06 21:07:41.801	2025-11-06 21:07:41.897	2	2	15
\.


--
-- Data for Name: UnidadPlan; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."UnidadPlan" (id, "planDeClasesId", periodo, contenido, capacidades, "horasTeoricas", "horasPracticas", "estrategiasMetodologicas", "mediosVerificacionEvaluacion", created_at, updated_at, recursos) FROM stdin;
1	1	Marzo (2ª Quincena)	UNIDAD 1: INTRODUCCIÓN (El Paraguay, Una provincia gigante, Integración política y cultural).	Comprender el proceso de consolidación, origen y antecedentes históricos de la música paraguaya.	2	0	Clase introductoria (Exposición oral). Presentación del programa.	Tareas y Trabajos prácticos.	2025-11-06 12:24:36.118	2025-11-06 12:24:36.118	{}
2	1	Abril (1ª Quincena)	UNIDAD 2: LOS INDÍGENAS Y SU MÚSICA (El prejuicio de lo estético, Análisis Morfológico).	Conocer y analizar características sociales y culturales de cada familia lingüística de la población indígena.	2	0	Clases magistrales. Uso de medios auxiliares (pizarra, folletos).	Evaluación continua del progreso.	2025-11-06 12:24:36.121	2025-11-06 12:24:36.121	{}
3	1	Abril (2ª Quincena)	UNIDAD 2 (Continuación) (Instrumentos musicales, Descripción más amplia de instrumentos étnicos).	Analizar la música desde la perspectiva del canto, los instrumentos, las danzas y los rituales.	2	0	Análisis de material bibliográfico (Ej: BOETTNER, MELIÁ).	Tareas y Trabajos prácticos sobre instrumentos.	2025-11-06 12:24:36.123	2025-11-06 12:24:36.123	{}
4	1	Mayo (1ª Quincena)	UNIDAD 3: LA MÚSICA DURANTE LA COLONIA. UNIDAD 4: LAS MISIONES JESUÍTICAS (Los jesuitas y la música).	Conocer las características culturales de la etapa de colonización. Analizar la labor de los misioneros y las características de la música reduccional.	2	0	Explicación detallada de los temas a trabajar (Exposición oral).	Evaluación de la comprensión y aplicación de conceptos.	2025-11-06 12:24:36.127	2025-11-06 12:24:36.127	{}
5	1	Mayo (2ª Quincena)	UNIDAD 4 (Continuación) (Músicos jesuitas destacados: Pedro Comentale, Domenico Zipoli, etc.).	Conocer biografía y obras de músicos paraguayos de cada etapa.	2	0	Clases magistrales enfocadas en personajes históricos.	Seguimiento del progreso en el estudio.	2025-11-06 12:24:36.131	2025-11-06 12:24:36.131	{}
6	1	Junio (1ª Quincena)	UNIDAD 5: LA INDEPENDENCIA (Música y la dictadura de Francia, El auténtico himno paraguayo, Músicos destacados).	Conocer las manifestaciones culturales de este periodo (1811-1840).	2	0	Enfoque en el estudio temático seleccionado.	Evaluación del progreso y dominio de los conceptos.	2025-11-06 12:24:36.133	2025-11-06 12:24:36.133	{}
7	1	Junio (2ª Quincena)	EVALUACIÓN 1ER. CUATRIMESTRE (Unidades 1 a 5).	Demostrar dominio y comprensión de los contenidos del primer cuatrimestre.	0	0	Prueba escrita cuatrimestral.	Prueba escrita cuatrimestral (Suma Tareas/Trabajos Prácticos).	2025-11-06 12:24:36.136	2025-11-06 12:24:36.136	{}
8	1	Julio (1ª Quincena)	UNIDAD 6: LOS LÓPEZ (Progreso material y cultural, Primeras referencias sobre Música Popular Paraguaya).	Analizar los procesos a través de las etapas históricas (Los López).	2	0	Se facilitarán materiales bibliográficos para el desarrollo de las lecciones.	Tareas y Trabajos prácticos.	2025-11-06 12:24:36.138	2025-11-06 12:24:36.138	{}
9	1	Julio (2ª Quincena)	UNIDAD 7: HIMNO NACIONAL PARAGUAYO. UNIDAD 8: LA GUERRA DE LA TRIPLE ALIANZA.	Conocer la historia del Himno y analizar el impacto cultural de la guerra.	2	0	Uso de textos específicos (Ej: CALZADA MACHO).	Seguimiento del progreso y aplicación de conceptos.	2025-11-06 12:24:36.14	2025-11-06 12:24:36.14	{}
10	1	Agosto (1ª Quincena)	UNIDAD 9: DANZAS PARAGUAYAS (Origen, Tipos, Trajes típicos).	Conocer rasgos culturales propios del paraguayo y las manifestaciones de su identidad.	2	0	Repaso y ampliación de las unidades trabajadas (Exposición oral).	Evaluación de la mejora en la comprensión y aplicación.	2025-11-06 12:24:36.142	2025-11-06 12:24:36.142	{}
11	1	Agosto (2ª Quincena)	UNIDAD 10: EL COMPUESTO. UNIDAD 11: EL JEJUVYKUE JERÁ.	Analizar estos géneros como expresiones musicales de los habitantes de esta tierra.	2	0	Práctica de técnicas de análisis.	Evaluación de dominio y precisión.	2025-11-06 12:24:36.144	2025-11-06 12:24:36.144	{}
12	1	Setiembre (1ª Quincena)	UNIDAD 12: LOS ESTACIONEROS O PASIONEROS. UNIDAD 13: MÚSICA PARAGUAYA (Popular, Géneros y Estilos: Polca, Guarania, Purahéi, Kyre’ŷ, etc.).	Analizar la función de las agrupaciones tradicionales. Analizar la música erudita y popular (Géneros y Estilos).	2	0	Estudio y perfeccionamiento temático.	Evaluación del avance y dominio de los géneros.	2025-11-06 12:24:36.147	2025-11-06 12:24:36.147	{}
13	1	Octubre (1ª Quincena)	UNIDAD 14: AGRUPACIONES TRADICIONALES (Cantores, Bandas Hyekue, Orquestas Típicas). UNIDAD 15: ZARZUELA PARAGUAYA (Generalidades).	Conocer la conformación de grupos tradicionales y reconocer al creador de la zarzuela (J.C. Moreno González).	2	0	Preparación para la evaluación.	Evaluación del dominio de las unidades.	2025-11-06 12:24:36.149	2025-11-06 12:24:36.149	{}
14	1	Octubre (2ª Quincena)	EVALUACIÓN 2DO. CUATRIMESTRE (Unidades 6 a 15).	Demostrar dominio y comprensión de los contenidos del segundo cuatrimestre.	0	0	Prueba escrita cuatrimestral.	Prueba escrita cuatrimestral (Requisito: 80% asistencia y tareas).	2025-11-06 12:24:36.151	2025-11-06 12:24:36.151	{}
15	1	Noviembre (hasta el 9)	UNIDAD 16: COMPOSITORES PARAGUAYOS DEL SIGLO XX (Mangoré, Flores, Giménez, etc.).	Analizar la música erudita y popular de compositores destacados.	2	0	Consolidación y perfeccionamiento de los temas. Exploración de bibliografía (SZARÁN, SÁNCHEZ HAASE).	Evaluación de la comprensión y aplicación de características estilísticas.	2025-11-06 12:24:36.153	2025-11-06 12:24:36.153	{}
16	1	Noviembre (10 al 14)	SEMANA DE EVALUACIÓN DE MATERIAS TEÓRICAS	Obtener un Término Medio Mínimo o superior a la calificación 2 resultante de los dos cuatrimestres para habilitar el examen final.	0	0	EVALUACIÓN FINAL (Según el cronograma institucional).	Evaluación Final (Requisito previo: T.M. habilitante y 11 clases de asistencia mínima por cuatrimestre).	2025-11-06 12:24:36.155	2025-11-06 12:24:36.155	{}
17	1	Noviembre (17 al 28)	UNIDAD 17: EL MOVIMIENTO DEL NUEVO CANCIONERO EN PARAGUAY. Cierre y Retroalimentación.	Reflexionar y emitir juicios de valor sobre la historia de la música paraguaya a lo largo del tiempo y en la actualidad.	4	0	Preparación para una presentación final/Trabajo de reflexión.	Certificación de Desempeño (El estudiante debe tener un 70% de las tareas y trabajos prácticos exigidos).	2025-11-06 12:24:36.157	2025-11-06 12:24:36.157	{}
18	2	Marzo (2ª Quincena)	UNIDAD I: CONTEXTUALIZACIÓN FILOSÓFICA DE LA ESTÉTICA (La filosofía como disciplina humanística).	Ubicar al estudiante en los ciclos intelectuales de sistemas filosóficos, propiciando la diversidad y pluralidad.	2	0	Exposición oral y Participación. Introducción a la bibliografía básica.	Registro anecdótico y Observación. Tareas de contextualización.	2025-11-06 12:24:36.258	2025-11-06 12:24:36.258	{}
19	2	Abril (1ª Q)	UNIDAD I (Continuación): El mundo del arte en el pensamiento filosófico.	Interpretar temas y problemas de la filosofía frente a las diversas disciplinas.	2	0	Clases expositivas-participativas. Apoyo con audición de obras varias.	Mapas conceptuales y/o Trabajos prácticos.	2025-11-06 12:24:36.26	2025-11-06 12:24:36.26	{}
20	2	Abril (2ª Q)	UNIDAD I (Cierre): La estética, crítica y teoría del arte.	Desarrollar lineamientos relevantes sobre la corriente estética de la filosofía.	2	0	Análisis de textos introductorios (Jiménez, Oliveras).	Evaluación continua de la comprensión.	2025-11-06 12:24:36.262	2025-11-06 12:24:36.262	{}
21	2	Mayo (1ª Q)	UNIDAD II: LA FILOSOFÍA ANTIGUA DEL ARTE (Mitos, Tragedias y el legado de la antigua Grecia).	Analizar los principales pensamientos filosóficos en el ámbito de la estética.	2	0	Exposición magistral. Análisis de fragmentos de Poética (Aristóteles).	Prueba oral o escrita corta.	2025-11-06 12:24:36.264	2025-11-06 12:24:36.264	{}
22	2	Mayo (2ª Q)	UNIDAD II (Continuación): Platón y el canon de belleza suprema; Aristóteles, el arte como vivencia e imitación.	Aplicar críticamente los pensamientos en el mundo del arte.	2	0	Lectura y discusión de El Banquete, Fedro (Platón).	Trabajos de investigación bibliográfica individual.	2025-11-06 12:24:36.266	2025-11-06 12:24:36.266	{}
23	2	Junio (1ª Q)	UNIDAD III: LA FILOSOFÍA DEL ARTE EN LA EDAD MODERNA (Kant, entre lo bello y lo sublime).	Indagar y contraponer los diversos criterios en la formulación de propios argumentos.	2	0	Exposición enfocada en Crítica del Juicio (Kant).	Escala de actitudes (participación).	2025-11-06 12:24:36.267	2025-11-06 12:24:36.267	{}
24	2	Junio (2ª Q)	EVALUACIÓN 1ER. CUATRIMESTRE (U. I, II, III inicio).	Demostrar comprensión de los sistemas filosóficos y estéticos iniciales.	0	0	Examen Cuatrimestral (Prueba escrita).	Examen Cuatrimestral (Suma tareas/trabajos).	2025-11-06 12:24:36.268	2025-11-06 12:24:36.268	{}
25	2	Julio (1ª Q)	UNIDAD III (Continuación): Hegel y el fin del arte; El idealismo alemán en la estética romántica.	Abordar aspectos relacionado al arte con argumentación filosófica.	2	0	Análisis de Introducción a la Estética (Hegel).	Portafolio de trabajos (recopilación de lecturas).	2025-11-06 12:24:36.269	2025-11-06 12:24:36.269	{}
26	2	Julio (2ª Q)	UNIDAD III (Cierre): Nietzsche y la voluntad de poder como arte.	Valorar la condición humana estética ante los cambios en el mundo de la técnica.	2	0	Discusión sobre El nacimiento de la tragedia (Nietzsche).	Tareas de análisis y reflexión.	2025-11-06 12:24:36.271	2025-11-06 12:24:36.271	{}
27	2	Agosto (1ª Q)	UNIDAD IV: PENSAMIENTO DEL SIGLO XX SOBRE EL ARTE (Heidegger, verdad y arte; Benjamín y el aura del arte).	Reflexionar sobre el impacto de la reproductibilidad técnica en la estética.	2	0	Clases expositivas. Apoyo con medios visuales (películas/videos). Análisis de La obra de arte... (Benjamín).	Trabajos de investigación bibliográfica (individual y/o grupal).	2025-11-06 12:24:36.272	2025-11-06 12:24:36.272	{}
28	2	Agosto (2ª Q)	UNIDAD IV (Continuación): Merleau-Ponty y la experiencia estética.	Interpretar la experiencia estética a través de la fenomenología.	2	0	Presentaciones de los alumnos sobre temas específicos.	Pruebas prácticas sobre aplicación de conceptos.	2025-11-06 12:24:36.273	2025-11-06 12:24:36.273	{}
29	2	Setiembre (1ª Q)	UNIDAD V: CONTEMPORANEIDAD EN LA ESTÉTICA FILOSÓFICA (Jameson y la playa estética).	Analizar el pensamiento posmoderno en relación al arte.	2	0	Discusión sobre Posmodernismo o la lógica cultural... (Jameson).	Evaluación continua basada en la participación en debates.	2025-11-06 12:24:36.274	2025-11-06 12:24:36.274	{}
30	2	Setiembre (2ª Q)	UNIDAD V (Continuación): Chul Han y la salvación de lo bello; Vattimo, en el crepúsculo del arte.	Analizar las corrientes estéticas actuales.	2	0	Exposición sobre La salvación de lo bello (Chul-Han) y El fin de la modernidad (Vattimo).	Elaboración de un argumento filosófico propio.	2025-11-06 12:24:36.275	2025-11-06 12:24:36.275	{}
31	2	Octubre (1ª Q)	UNIDAD V (Cierre): Gadamer como justificación del arte. Repaso e Integración.	Integrar críticamente los diversos criterios en la formulación de argumentos propios.	2	0	Clases de repaso y resolución de dudas.	Preparación para el examen cuatrimestral.	2025-11-06 12:24:36.276	2025-11-06 12:24:36.276	{}
32	2	Octubre (2ª Q)	EVALUACIÓN 2DO. CUATRIMESTRE (U. III cierre, IV, V).	Demostrar dominio de las corrientes estéticas modernas y contemporáneas.	0	0	Examen Cuatrimestral (Prueba escrita).	Examen Cuatrimestral. El conservatorio establece que la participación en conciertos vale puntaje adicional.	2025-11-06 12:24:36.277	2025-11-06 12:24:36.277	{}
33	2	Noviembre (hasta el 9)	CONSOLIDACIÓN Y PREPARACIÓN FINAL (Integración de los 5 ejes).	Habilitarse para la evaluación final obteniendo el término medio mínimo.	2	0	Preparación de la defensa de trabajos finales o proyectos de investigación.	Revisión de Portafolio.	2025-11-06 12:24:36.279	2025-11-06 12:24:36.279	{}
34	2	Noviembre (10 al 14)	SEMANA DE EVALUACIÓN DE MATERIAS TEÓRICAS	N/A	0	0	N/A	EVALUACIÓN FINAL (Según cronograma).	2025-11-06 12:24:36.28	2025-11-06 12:24:36.28	{}
35	2	Noviembre (17 al 28)	UNIDAD 17: EL MOVIMIENTO DEL NUEVO CANCIONERO EN PARAGUAY. Cierre y Retroalimentación.	Reflexionar y emitir juicios de valor sobre la historia de la música paraguaya a lo largo del tiempo y en la actualidad.	4	0	Preparación para una presentación final/Trabajo de reflexión.	Certificación de Desempeño (El estudiante debe tener un 70% de las tareas y trabajos prácticos exigidos).	2025-11-06 12:24:36.281	2025-11-06 12:24:36.281	{}
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."User" (id, username, password) FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
a538b890-a747-4d92-b04c-0b7907c633a8	432a81495fd7b90f0d99ab1196e02edc698d699181685acbbd53802dd8af05f7	2025-11-06 13:24:26.776598+01	20250825134907_add_submission_fields_to_tarea	\N	\N	2025-11-06 13:24:26.774196+01	1
d4fb5252-91ca-421a-865e-424b1c0e5870	0bc5b0d9dde5fbdb4f169e76ade988faefea45b33a0dad59802f734089909995	2025-11-06 13:24:26.602725+01	20250707203516_init	\N	\N	2025-11-06 13:24:26.575743+01	1
67c4d09c-3029-4fde-aa24-500d6ace6427	a40bebd1889b6ee2bb79a14f86aec290a3308490acce8d51452762dc0ee23797	2025-11-06 13:24:26.632387+01	20250707210225_align_schema_with_api	\N	\N	2025-11-06 13:24:26.60366+01	1
5f7360ff-6a97-4891-b956-b3a0f454e4a8	9c5bc0e9e8b8a21299b908805353b992da0862d9bedefd6d573e86496fc75e8d	2025-11-06 13:24:26.84302+01	20250922135008_add_attendance_and_payment_fields	\N	\N	2025-11-06 13:24:26.823717+01	1
3dbdf2c6-56aa-4b6c-b748-34f72209ba00	e99919f6ef206bff9e004ce59b613ff95c34f2e722f7afd703c5bc1010ff8643	2025-11-06 13:24:26.639019+01	20250707214137_add_main_role_to_composer	\N	\N	2025-11-06 13:24:26.634014+01	1
388b7cb6-742d-41a2-956b-d3ace4e7dab9	c1976bb14b5c8e758f34e936a3ae45bc399351d735deb09bb5c0fbe3dc763cc0	2025-11-06 13:24:26.780098+01	20250825141759_add_puntos_obtenidos_to_tarea	\N	\N	2025-11-06 13:24:26.777251+01	1
3d59fc65-33a4-4cb7-b68f-b53e7a4cb215	2511951d857535fd4b92eb4152a8f48692d275fb713b00295026e0adc7a7576a	2025-11-06 13:24:26.645787+01	20250707224429_add_multiple_roles_and_enum_corrected	\N	\N	2025-11-06 13:24:26.6402+01	1
84b79057-eead-439a-88ad-bc9c68745a3a	0235a751758e33a77d8ec8f92d69fca0119db49afcfb9521a4ab555cdd0c1cf1	2025-11-06 13:24:26.650494+01	20250708103332_add_score_and_rejection_fields	\N	\N	2025-11-06 13:24:26.646771+01	1
2899f9f0-3610-477b-b714-f619df928434	05f05e0e06234b2f3ee93b2cbe0799ce535a97f069c2ac3d04a287f1b9dec582	2025-11-06 13:24:26.657247+01	20250709102139_add_student_fields	\N	\N	2025-11-06 13:24:26.65178+01	1
1985d831-f71c-4089-a4af-727ccab1cdae	5ecf0a71017d06924a4c8b7eb05ae6fbdcf5b807e3cb3aa675a860e96aafcc37	2025-11-06 13:24:26.792968+01	20250904133405_add_evaluation_scoring_and_puntuacion_type	\N	\N	2025-11-06 13:24:26.781175+01	1
721c7604-d6f2-4527-a452-2976997f635e	d155b5c204a71a27b4727250829a34b11e1c5850fc558fec758e840b85e8d81f	2025-11-06 13:24:26.669958+01	20250808120037_add_edit_suggestion_model	\N	\N	2025-11-06 13:24:26.658173+01	1
56118593-1c33-4815-870c-2fe29c1b5915	e60f54b96237cb00490f4ff9c6ccce85a77f9a9bc1642ee167ec204b684a41d1	2025-11-06 13:24:26.676795+01	20250808140759_add_student_fields_to_editsuggestion	\N	\N	2025-11-06 13:24:26.671343+01	1
279ce4df-715c-435d-976d-7e03042f6ffc	58d3e808ccb7635f6e71321885e768de06a18ee1b9523c9d3fc45043a61965cf	2025-11-06 13:24:26.92881+01	20251001223826_add_class_plan_module	\N	\N	2025-11-06 13:24:26.91227+01	1
0690835e-9b07-4089-a7cf-0bff31b5af3c	3999cc92982317e67b35eb309df6aa5c0f1046f46725b4c85896e4d2e88781a5	2025-11-06 13:24:26.682184+01	20250811010658_add_points_to_suggestions	\N	\N	2025-11-06 13:24:26.677949+01	1
87d3ce09-b410-4bbc-8507-d71c01e0b4c4	72a5f798f9451358c2174d4c83f2b1db0740900e122220d95fecc09f11d4fa70	2025-11-06 13:24:26.796173+01	20250905114828_add_student_role	\N	\N	2025-11-06 13:24:26.793809+01	1
7406a322-8d12-4b16-9274-d2479c88afac	bdd8383ea12692963f29edced19f61c7ddc300a2430f61a9affbe21de0132109	2025-11-06 13:24:26.741053+01	20250821124054_full_academic_module	\N	\N	2025-11-06 13:24:26.683493+01	1
2a81bf1b-399d-45dd-945a-0a6e4d23fd64	2f2595a81e9f6aa161fb43d7b01f7596f03621fd0dceaaf1dc29300eda243fc5	2025-11-06 13:24:26.769901+01	20250824235747_add_id_to_catedra_alumno_and_inverse_relation	\N	\N	2025-11-06 13:24:26.741938+01	1
f62612bc-e080-4e47-8b12-82fd6a7b996a	e3afccc61ffab2c22097d41cf3bf89ab10718c08c0274f0574c6723dbff2c3b5	2025-11-06 13:24:26.869362+01	20250922145245_add_payment_and_cost_models_with_relations	\N	\N	2025-11-06 13:24:26.844449+01	1
59767c22-1ae4-4e25-a504-fc5a813871e4	8887b2b56f4b76db6cd14d05f0413fdb93967a77e5336419ddce4dd165e7a5ce	2025-11-06 13:24:26.773516+01	20250825104632_add_multimedia_to_tareas	\N	\N	2025-11-06 13:24:26.770698+01	1
b9b16f5a-b995-438c-9466-ce39a03868ea	4f40c296b0f28af5acdc67d7bf113416b3ff19ede3237e5ea4e7e63c6b84cde8	2025-11-06 13:24:26.802384+01	20250905143147_make_catedraid_optional_in_puntuacion	\N	\N	2025-11-06 13:24:26.796929+01	1
b42bcef7-d6cd-4310-8ddd-ffa887fce4c5	c64cbeba88d16ab373b3d9f7e7064c465a89dca6bc1c3a13e00318e93c88c110	2025-11-06 13:24:26.809381+01	20250908132230_update_calificacion_evaluation_unique_constraint	\N	\N	2025-11-06 13:24:26.803132+01	1
8ccc66e7-3a7a-4c8c-b3fa-93f19d63b681	a62e9f1aa737843e8acd261dd9381e8c20c18b5d6508314a6509d0d28bf31b7f	2025-11-06 13:24:26.884901+01	20250923131141_add_catedra_dia_horario	\N	\N	2025-11-06 13:24:26.870237+01	1
ad45969d-0e63-4508-86dd-331a1fe9fa3e	6ea1a433eb74073f2155a6f61994bc36066ae60383216ad292186ab0fc8c04be	2025-11-06 13:24:26.819459+01	20250912214204_add_docente_model	\N	\N	2025-11-06 13:24:26.810081+01	1
6c247afd-0daf-4c04-a1d1-14b7e0983258	fdd59ea2441c64e98745e27fd8eb2943466395ea6f4485271a095bf5100ec340	2025-11-06 13:24:26.823025+01	20250913012435_add_telefono_direccion_to_docente	\N	\N	2025-11-06 13:24:26.820183+01	1
61e7f9d0-9c8c-44fb-a7ca-34dc13d43a83	e39b4804d3836baa30d35f65107612038390ba7d659f13d9ca947b8782a30326	2025-11-06 13:24:27.016632+01	20251029192418_add_unidad_plan_relations	\N	\N	2025-11-06 13:24:27.012498+01	1
1b01c134-388e-4189-81eb-976765d4e25e	84bbd6f5e9cf9401d1fe30b1dc7b0ed0a1a31eed69153d384d06a6daf50dca57	2025-11-06 13:24:26.944097+01	20251002094622_add_publicacion_interaccion	\N	\N	2025-11-06 13:24:26.930216+01	1
75e1c51f-eb30-4df5-9979-510bfafc03a7	9d5221fe6a639ad66cbf3066fba5ea58a61592f1df141e275c5ac72024a6c89f	2025-11-06 13:24:26.891371+01	20250923145259_add_parent_guardian_fields_to_alumno	\N	\N	2025-11-06 13:24:26.885841+01	1
fd53242c-5fef-4ce4-8871-fb2fd2739132	3067e2a4ab3676ffb3d403ad0ebd1d172b56d70cf06272e239305770b83ea2da	2025-11-06 13:24:26.910833+01	20250924114956_add_tablon_models_corrected	\N	\N	2025-11-06 13:24:26.892852+01	1
857caf5f-5969-49d4-9500-f5c329b8c4cf	998a7114a958bb4180efc5faf271305370f7fe1436b6d8a41f12ad5b6f6bc6ad	2025-11-06 13:24:27.001144+01	20251010213236_add_ensemble_orchestra_role	\N	\N	2025-11-06 13:24:26.978425+01	1
228cb16f-f2db-4004-b5ff-b3763a0ff909	fbaa346260b3b542755475744f8fd5808c9bbe504f526fa07d642b0ef10532c3	2025-11-06 13:24:26.97284+01	20251003133309_refactor_tareas_final	\N	\N	2025-11-06 13:24:26.945156+01	1
ba400f8d-b255-4e78-a922-189d5b2ec137	8bdfecc3781f2eb020dc89220a86196efcf3c52872b0691aaef49fea153bfb0e	2025-11-06 13:24:27.011675+01	20251028124347_update_unidad_plan_resources_to_json	\N	\N	2025-11-06 13:24:27.008151+01	1
d7879d66-7eba-487f-ae88-c80f48bb2f16	5345cb1a70365ec824ad774d546b1f91fd2717a5a1cbfbd54d0c90a6f11ee98b	2025-11-06 13:24:26.977426+01	20251004004204_add_visible_to_students_to_publicacion	\N	\N	2025-11-06 13:24:26.973641+01	1
3a0dad63-65c5-4b0a-bb22-fd58aaac801c	cf5690e652c4eaa13bb110c6358f2701cd24bbb173cdc27d9eefa629d3590c62	2025-11-06 13:24:27.006074+01	20251021131539_add_photo_url_to_edit_suggestion	\N	\N	2025-11-06 13:24:27.002866+01	1
00544840-50af-41f1-82ea-6a7197c53061	4135748da85f799d92cee4d0a4e1876815e32cb98e86d2a68e166bc821b3eb56	2025-11-07 12:10:38.87493+01	20251107010614_add_comentario_docente_to_tarea_asignacion		\N	2025-11-07 12:10:38.87493+01	0
\.


--
-- Name: Alumno_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."Alumno_id_seq"', 18, true);


--
-- Name: Asistencia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."Asistencia_id_seq"', 1, false);


--
-- Name: CalificacionEvaluacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."CalificacionEvaluacion_id_seq"', 34, true);


--
-- Name: CatedraAlumno_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."CatedraAlumno_id_seq"', 18, true);


--
-- Name: CatedraDiaHorario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."CatedraDiaHorario_id_seq"', 2, true);


--
-- Name: Catedra_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."Catedra_id_seq"', 2, true);


--
-- Name: ComentarioPublicacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."ComentarioPublicacion_id_seq"', 1, false);


--
-- Name: Comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."Comment_id_seq"', 1, false);


--
-- Name: Composer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."Composer_id_seq"', 53, true);


--
-- Name: CostoCatedra_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."CostoCatedra_id_seq"', 1, false);


--
-- Name: DiaClase_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."DiaClase_id_seq"', 1, false);


--
-- Name: Docente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."Docente_id_seq"', 1, true);


--
-- Name: EditSuggestion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."EditSuggestion_id_seq"', 1, false);


--
-- Name: EvaluacionAsignacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."EvaluacionAsignacion_id_seq"', 34, true);


--
-- Name: Evaluacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."Evaluacion_id_seq"', 5, true);


--
-- Name: Opcion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."Opcion_id_seq"', 1, false);


--
-- Name: Otp_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."Otp_id_seq"', 14, true);


--
-- Name: Pago_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."Pago_id_seq"', 1, false);


--
-- Name: PlanDeClases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."PlanDeClases_id_seq"', 2, true);


--
-- Name: Pregunta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."Pregunta_id_seq"', 1, false);


--
-- Name: PublicacionInteraccion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."PublicacionInteraccion_id_seq"', 1, false);


--
-- Name: Publicacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."Publicacion_id_seq"', 2, true);


--
-- Name: Puntuacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."Puntuacion_id_seq"', 74, true);


--
-- Name: Rating_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."Rating_id_seq"', 1, false);


--
-- Name: RespuestaAlumno_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."RespuestaAlumno_id_seq"', 1, false);


--
-- Name: TareaAsignacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."TareaAsignacion_id_seq"', 52, true);


--
-- Name: TareaMaestra_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."TareaMaestra_id_seq"', 6, true);


--
-- Name: UnidadPlan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."UnidadPlan_id_seq"', 35, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."User_id_seq"', 1, false);


--
-- Name: Alumno Alumno_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Alumno"
    ADD CONSTRAINT "Alumno_pkey" PRIMARY KEY (id);


--
-- Name: Asistencia Asistencia_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Asistencia"
    ADD CONSTRAINT "Asistencia_pkey" PRIMARY KEY (id);


--
-- Name: CalificacionEvaluacion CalificacionEvaluacion_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."CalificacionEvaluacion"
    ADD CONSTRAINT "CalificacionEvaluacion_pkey" PRIMARY KEY (id);


--
-- Name: CatedraAlumno CatedraAlumno_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."CatedraAlumno"
    ADD CONSTRAINT "CatedraAlumno_pkey" PRIMARY KEY (id);


--
-- Name: CatedraDiaHorario CatedraDiaHorario_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."CatedraDiaHorario"
    ADD CONSTRAINT "CatedraDiaHorario_pkey" PRIMARY KEY (id);


--
-- Name: Catedra Catedra_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Catedra"
    ADD CONSTRAINT "Catedra_pkey" PRIMARY KEY (id);


--
-- Name: ComentarioPublicacion ComentarioPublicacion_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."ComentarioPublicacion"
    ADD CONSTRAINT "ComentarioPublicacion_pkey" PRIMARY KEY (id);


--
-- Name: Comment Comment_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_pkey" PRIMARY KEY (id);


--
-- Name: Composer Composer_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Composer"
    ADD CONSTRAINT "Composer_pkey" PRIMARY KEY (id);


--
-- Name: CostoCatedra CostoCatedra_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."CostoCatedra"
    ADD CONSTRAINT "CostoCatedra_pkey" PRIMARY KEY (id);


--
-- Name: DiaClase DiaClase_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."DiaClase"
    ADD CONSTRAINT "DiaClase_pkey" PRIMARY KEY (id);


--
-- Name: Docente Docente_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Docente"
    ADD CONSTRAINT "Docente_pkey" PRIMARY KEY (id);


--
-- Name: EditSuggestion EditSuggestion_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."EditSuggestion"
    ADD CONSTRAINT "EditSuggestion_pkey" PRIMARY KEY (id);


--
-- Name: EvaluacionAsignacion EvaluacionAsignacion_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."EvaluacionAsignacion"
    ADD CONSTRAINT "EvaluacionAsignacion_pkey" PRIMARY KEY (id);


--
-- Name: Evaluacion Evaluacion_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Evaluacion"
    ADD CONSTRAINT "Evaluacion_pkey" PRIMARY KEY (id);


--
-- Name: Opcion Opcion_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Opcion"
    ADD CONSTRAINT "Opcion_pkey" PRIMARY KEY (id);


--
-- Name: Otp Otp_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Otp"
    ADD CONSTRAINT "Otp_pkey" PRIMARY KEY (id);


--
-- Name: Pago Pago_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Pago"
    ADD CONSTRAINT "Pago_pkey" PRIMARY KEY (id);


--
-- Name: PlanDeClases PlanDeClases_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."PlanDeClases"
    ADD CONSTRAINT "PlanDeClases_pkey" PRIMARY KEY (id);


--
-- Name: Pregunta Pregunta_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Pregunta"
    ADD CONSTRAINT "Pregunta_pkey" PRIMARY KEY (id);


--
-- Name: PublicacionInteraccion PublicacionInteraccion_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."PublicacionInteraccion"
    ADD CONSTRAINT "PublicacionInteraccion_pkey" PRIMARY KEY (id);


--
-- Name: Publicacion Publicacion_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Publicacion"
    ADD CONSTRAINT "Publicacion_pkey" PRIMARY KEY (id);


--
-- Name: Puntuacion Puntuacion_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Puntuacion"
    ADD CONSTRAINT "Puntuacion_pkey" PRIMARY KEY (id);


--
-- Name: Rating Rating_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Rating"
    ADD CONSTRAINT "Rating_pkey" PRIMARY KEY (id);


--
-- Name: RespuestaAlumno RespuestaAlumno_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."RespuestaAlumno"
    ADD CONSTRAINT "RespuestaAlumno_pkey" PRIMARY KEY (id);


--
-- Name: TareaAsignacion TareaAsignacion_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."TareaAsignacion"
    ADD CONSTRAINT "TareaAsignacion_pkey" PRIMARY KEY (id);


--
-- Name: TareaMaestra TareaMaestra_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."TareaMaestra"
    ADD CONSTRAINT "TareaMaestra_pkey" PRIMARY KEY (id);


--
-- Name: UnidadPlan UnidadPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."UnidadPlan"
    ADD CONSTRAINT "UnidadPlan_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Alumno_email_key; Type: INDEX; Schema: public; Owner: composer_user
--

CREATE UNIQUE INDEX "Alumno_email_key" ON public."Alumno" USING btree (email);


--
-- Name: Asistencia_alumnoId_diaClaseId_key; Type: INDEX; Schema: public; Owner: composer_user
--

CREATE UNIQUE INDEX "Asistencia_alumnoId_diaClaseId_key" ON public."Asistencia" USING btree ("alumnoId", "diaClaseId");


--
-- Name: CalificacionEvaluacion_alumnoId_evaluacionAsignacionId_key; Type: INDEX; Schema: public; Owner: composer_user
--

CREATE UNIQUE INDEX "CalificacionEvaluacion_alumnoId_evaluacionAsignacionId_key" ON public."CalificacionEvaluacion" USING btree ("alumnoId", "evaluacionAsignacionId");


--
-- Name: CalificacionEvaluacion_evaluacionAsignacionId_key; Type: INDEX; Schema: public; Owner: composer_user
--

CREATE UNIQUE INDEX "CalificacionEvaluacion_evaluacionAsignacionId_key" ON public."CalificacionEvaluacion" USING btree ("evaluacionAsignacionId");


--
-- Name: CatedraAlumno_catedraId_alumnoId_key; Type: INDEX; Schema: public; Owner: composer_user
--

CREATE UNIQUE INDEX "CatedraAlumno_catedraId_alumnoId_key" ON public."CatedraAlumno" USING btree ("catedraId", "alumnoId");


--
-- Name: CatedraAlumno_catedraId_composerId_key; Type: INDEX; Schema: public; Owner: composer_user
--

CREATE UNIQUE INDEX "CatedraAlumno_catedraId_composerId_key" ON public."CatedraAlumno" USING btree ("catedraId", "composerId");


--
-- Name: CostoCatedra_catedraId_key; Type: INDEX; Schema: public; Owner: composer_user
--

CREATE UNIQUE INDEX "CostoCatedra_catedraId_key" ON public."CostoCatedra" USING btree ("catedraId");


--
-- Name: Docente_email_key; Type: INDEX; Schema: public; Owner: composer_user
--

CREATE UNIQUE INDEX "Docente_email_key" ON public."Docente" USING btree (email);


--
-- Name: EvaluacionAsignacion_alumnoId_evaluacionId_key; Type: INDEX; Schema: public; Owner: composer_user
--

CREATE UNIQUE INDEX "EvaluacionAsignacion_alumnoId_evaluacionId_key" ON public."EvaluacionAsignacion" USING btree ("alumnoId", "evaluacionId");


--
-- Name: EvaluacionAsignacion_publicacionId_key; Type: INDEX; Schema: public; Owner: composer_user
--

CREATE UNIQUE INDEX "EvaluacionAsignacion_publicacionId_key" ON public."EvaluacionAsignacion" USING btree ("publicacionId");


--
-- Name: Otp_email_key; Type: INDEX; Schema: public; Owner: composer_user
--

CREATE UNIQUE INDEX "Otp_email_key" ON public."Otp" USING btree (email);


--
-- Name: Pago_catedraAlumnoId_tipo_pago_periodo_cubierto_key; Type: INDEX; Schema: public; Owner: composer_user
--

CREATE UNIQUE INDEX "Pago_catedraAlumnoId_tipo_pago_periodo_cubierto_key" ON public."Pago" USING btree ("catedraAlumnoId", tipo_pago, periodo_cubierto);


--
-- Name: PublicacionInteraccion_publicacionId_alumnoId_key; Type: INDEX; Schema: public; Owner: composer_user
--

CREATE UNIQUE INDEX "PublicacionInteraccion_publicacionId_alumnoId_key" ON public."PublicacionInteraccion" USING btree ("publicacionId", "alumnoId");


--
-- Name: PublicacionInteraccion_publicacionId_docenteId_key; Type: INDEX; Schema: public; Owner: composer_user
--

CREATE UNIQUE INDEX "PublicacionInteraccion_publicacionId_docenteId_key" ON public."PublicacionInteraccion" USING btree ("publicacionId", "docenteId");


--
-- Name: Publicacion_evaluacionAsignacionId_key; Type: INDEX; Schema: public; Owner: composer_user
--

CREATE UNIQUE INDEX "Publicacion_evaluacionAsignacionId_key" ON public."Publicacion" USING btree ("evaluacionAsignacionId");


--
-- Name: Publicacion_evaluacionMaestraId_key; Type: INDEX; Schema: public; Owner: composer_user
--

CREATE UNIQUE INDEX "Publicacion_evaluacionMaestraId_key" ON public."Publicacion" USING btree ("evaluacionMaestraId");


--
-- Name: Publicacion_tareaMaestraId_key; Type: INDEX; Schema: public; Owner: composer_user
--

CREATE UNIQUE INDEX "Publicacion_tareaMaestraId_key" ON public."Publicacion" USING btree ("tareaMaestraId");


--
-- Name: Rating_composerId_ip_address_key; Type: INDEX; Schema: public; Owner: composer_user
--

CREATE UNIQUE INDEX "Rating_composerId_ip_address_key" ON public."Rating" USING btree ("composerId", ip_address);


--
-- Name: RespuestaAlumno_alumnoId_preguntaId_key; Type: INDEX; Schema: public; Owner: composer_user
--

CREATE UNIQUE INDEX "RespuestaAlumno_alumnoId_preguntaId_key" ON public."RespuestaAlumno" USING btree ("alumnoId", "preguntaId");


--
-- Name: TareaAsignacion_alumnoId_tareaMaestraId_key; Type: INDEX; Schema: public; Owner: composer_user
--

CREATE UNIQUE INDEX "TareaAsignacion_alumnoId_tareaMaestraId_key" ON public."TareaAsignacion" USING btree ("alumnoId", "tareaMaestraId");


--
-- Name: TareaMaestra_publicacionId_key; Type: INDEX; Schema: public; Owner: composer_user
--

CREATE UNIQUE INDEX "TareaMaestra_publicacionId_key" ON public."TareaMaestra" USING btree ("publicacionId");


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: composer_user
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: Asistencia Asistencia_diaClaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Asistencia"
    ADD CONSTRAINT "Asistencia_diaClaseId_fkey" FOREIGN KEY ("diaClaseId") REFERENCES public."DiaClase"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CalificacionEvaluacion CalificacionEvaluacion_evaluacionAsignacionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."CalificacionEvaluacion"
    ADD CONSTRAINT "CalificacionEvaluacion_evaluacionAsignacionId_fkey" FOREIGN KEY ("evaluacionAsignacionId") REFERENCES public."EvaluacionAsignacion"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CatedraAlumno CatedraAlumno_catedraId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."CatedraAlumno"
    ADD CONSTRAINT "CatedraAlumno_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES public."Catedra"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CatedraAlumno CatedraAlumno_composerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."CatedraAlumno"
    ADD CONSTRAINT "CatedraAlumno_composerId_fkey" FOREIGN KEY ("composerId") REFERENCES public."Composer"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CatedraDiaHorario CatedraDiaHorario_catedraId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."CatedraDiaHorario"
    ADD CONSTRAINT "CatedraDiaHorario_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES public."Catedra"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Catedra Catedra_docenteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Catedra"
    ADD CONSTRAINT "Catedra_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES public."Docente"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ComentarioPublicacion ComentarioPublicacion_autorDocenteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."ComentarioPublicacion"
    ADD CONSTRAINT "ComentarioPublicacion_autorDocenteId_fkey" FOREIGN KEY ("autorDocenteId") REFERENCES public."Docente"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ComentarioPublicacion ComentarioPublicacion_publicacionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."ComentarioPublicacion"
    ADD CONSTRAINT "ComentarioPublicacion_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES public."Publicacion"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Comment Comment_composerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_composerId_fkey" FOREIGN KEY ("composerId") REFERENCES public."Composer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CostoCatedra CostoCatedra_catedraId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."CostoCatedra"
    ADD CONSTRAINT "CostoCatedra_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES public."Catedra"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DiaClase DiaClase_catedraId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."DiaClase"
    ADD CONSTRAINT "DiaClase_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES public."Catedra"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EditSuggestion EditSuggestion_composerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."EditSuggestion"
    ADD CONSTRAINT "EditSuggestion_composerId_fkey" FOREIGN KEY ("composerId") REFERENCES public."Composer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EvaluacionAsignacion EvaluacionAsignacion_evaluacionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."EvaluacionAsignacion"
    ADD CONSTRAINT "EvaluacionAsignacion_evaluacionId_fkey" FOREIGN KEY ("evaluacionId") REFERENCES public."Evaluacion"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Evaluacion Evaluacion_catedraId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Evaluacion"
    ADD CONSTRAINT "Evaluacion_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES public."Catedra"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Evaluacion Evaluacion_unidadPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Evaluacion"
    ADD CONSTRAINT "Evaluacion_unidadPlanId_fkey" FOREIGN KEY ("unidadPlanId") REFERENCES public."UnidadPlan"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Opcion Opcion_preguntaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Opcion"
    ADD CONSTRAINT "Opcion_preguntaId_fkey" FOREIGN KEY ("preguntaId") REFERENCES public."Pregunta"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Pago Pago_catedraAlumnoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Pago"
    ADD CONSTRAINT "Pago_catedraAlumnoId_fkey" FOREIGN KEY ("catedraAlumnoId") REFERENCES public."CatedraAlumno"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Pago Pago_confirmadoPorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Pago"
    ADD CONSTRAINT "Pago_confirmadoPorId_fkey" FOREIGN KEY ("confirmadoPorId") REFERENCES public."Docente"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PlanDeClases PlanDeClases_catedraId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."PlanDeClases"
    ADD CONSTRAINT "PlanDeClases_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES public."Catedra"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PlanDeClases PlanDeClases_docenteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."PlanDeClases"
    ADD CONSTRAINT "PlanDeClases_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES public."Docente"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Pregunta Pregunta_evaluacionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Pregunta"
    ADD CONSTRAINT "Pregunta_evaluacionId_fkey" FOREIGN KEY ("evaluacionId") REFERENCES public."Evaluacion"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PublicacionInteraccion PublicacionInteraccion_docenteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."PublicacionInteraccion"
    ADD CONSTRAINT "PublicacionInteraccion_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES public."Docente"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PublicacionInteraccion PublicacionInteraccion_publicacionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."PublicacionInteraccion"
    ADD CONSTRAINT "PublicacionInteraccion_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES public."Publicacion"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Publicacion Publicacion_autorDocenteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Publicacion"
    ADD CONSTRAINT "Publicacion_autorDocenteId_fkey" FOREIGN KEY ("autorDocenteId") REFERENCES public."Docente"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Publicacion Publicacion_catedraId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Publicacion"
    ADD CONSTRAINT "Publicacion_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES public."Catedra"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Publicacion Publicacion_evaluacionAsignacionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Publicacion"
    ADD CONSTRAINT "Publicacion_evaluacionAsignacionId_fkey" FOREIGN KEY ("evaluacionAsignacionId") REFERENCES public."EvaluacionAsignacion"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Publicacion Publicacion_evaluacionMaestraId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Publicacion"
    ADD CONSTRAINT "Publicacion_evaluacionMaestraId_fkey" FOREIGN KEY ("evaluacionMaestraId") REFERENCES public."Evaluacion"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Publicacion Publicacion_tareaMaestraId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Publicacion"
    ADD CONSTRAINT "Publicacion_tareaMaestraId_fkey" FOREIGN KEY ("tareaMaestraId") REFERENCES public."TareaMaestra"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Puntuacion Puntuacion_catedraId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Puntuacion"
    ADD CONSTRAINT "Puntuacion_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES public."Catedra"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Rating Rating_composerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Rating"
    ADD CONSTRAINT "Rating_composerId_fkey" FOREIGN KEY ("composerId") REFERENCES public."Composer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RespuestaAlumno RespuestaAlumno_opcionElegidaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."RespuestaAlumno"
    ADD CONSTRAINT "RespuestaAlumno_opcionElegidaId_fkey" FOREIGN KEY ("opcionElegidaId") REFERENCES public."Opcion"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RespuestaAlumno RespuestaAlumno_preguntaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."RespuestaAlumno"
    ADD CONSTRAINT "RespuestaAlumno_preguntaId_fkey" FOREIGN KEY ("preguntaId") REFERENCES public."Pregunta"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TareaAsignacion TareaAsignacion_tareaMaestraId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."TareaAsignacion"
    ADD CONSTRAINT "TareaAsignacion_tareaMaestraId_fkey" FOREIGN KEY ("tareaMaestraId") REFERENCES public."TareaMaestra"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TareaMaestra TareaMaestra_catedraId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."TareaMaestra"
    ADD CONSTRAINT "TareaMaestra_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES public."Catedra"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TareaMaestra TareaMaestra_unidadPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."TareaMaestra"
    ADD CONSTRAINT "TareaMaestra_unidadPlanId_fkey" FOREIGN KEY ("unidadPlanId") REFERENCES public."UnidadPlan"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: UnidadPlan UnidadPlan_planDeClasesId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."UnidadPlan"
    ADD CONSTRAINT "UnidadPlan_planDeClasesId_fkey" FOREIGN KEY ("planDeClasesId") REFERENCES public."PlanDeClases"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

