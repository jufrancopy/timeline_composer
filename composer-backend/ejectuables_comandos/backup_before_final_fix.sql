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
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


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
    submission_date timestamp(3) without time zone,
    puntos_obtenidos integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    "alumnoId" integer NOT NULL,
    "tareaMaestraId" integer NOT NULL,
    comentario_docente text,
    submission_path text[] DEFAULT ARRAY[]::text[]
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
6	Ricardo Antonio 	Frutos Sánchez	ricardofrutos86@gmail.com	0981215311	7ma Pyda 825 c/ Ayolas	Guitarra Eléctrica	Teoría I, Informática, Instrumento, Ensamble de Jazz	2025-10-02 20:09:53.021	2025-10-02 20:09:53.021	\N	\N	f
7	Fabrizio Maxiliano 	Ruíz Ortega	fabroj777@gmail.com	0991995951	Tte Rojas Silva y 21 Proyectadas	Guitarra Eléctrica	Teoría I, Informática, Ensamble de Jazz, Instrumento	2025-10-02 20:14:06.766	2025-10-02 20:14:06.766	\N	\N	f
8	Kathia Verenize	González Amarilla	kathiayiya@gmail.com	0984200962	Urundey c/ Concepción - Barrio Hipódromo 	Piano Clásico	Teoría I, Instrumento, Ensamble	2025-10-02 20:16:49.709	2025-10-02 20:16:49.709	\N	\N	f
9	Iván Lorenzo	Domaniczky	ivandomaniczky@hotmail.com	0994281941	Mcal Estigarribia c/ Mayor Fleitas	Piano Clásico	Tteoria I, Instrumento, Coro Polifónico	2025-10-02 20:19:10.919	2025-10-02 20:19:10.919	\N	\N	f
10	Angel Gabriel 	Rodríguez Galeano	anglrodga@gmai.com	0981854219	Estados Unidos, 16 e/ 17 Pyda	Guitarra Clásica	Instrumento, Teoría I, Coro Polifónico	2025-10-02 20:22:07.626	2025-10-02 20:22:07.626	\N	\N	f
2	Julio	Franco	jucfra23@gmail.com	0981574711	Laurelty 4565, Luque - Paraguay	Cello	Usuario de prueba (docente y alumno).	2025-10-02 15:01:19.677	2025-10-04 00:12:12.585	\N	\N	f
1	Alumno	Prueba	filoartepy@gmail.com	111222333	Calle Falsa 123, Ciudad de Prueba	Piano	Alumno utilizado para pruebas.	2025-10-02 15:01:19.64	2025-10-04 00:12:47.321	\N	\N	t
11	Leandro Esteban	Lugo Ruiz	leandrolugo129@gmail.com	\N	\N	\N	\N	2025-11-07 23:07:51.139	2025-11-07 23:07:51.139	\N	\N	f
12	Liz Vanessa	Britez Gomez	lizvanesabritezgomez@gmail.com	\N	\N	\N	\N	2025-11-07 23:07:51.149	2025-11-07 23:07:51.149	\N	\N	f
13	Lourdes Natalia	Meza Escurra	loumeza85@gmail.com	\N	\N	\N	\N	2025-11-07 23:07:51.159	2025-11-07 23:07:51.159	\N	\N	f
14	Carmina Araceli	Colman Martinez	carminacolman@gmail.com	\N	\N	\N	\N	2025-11-07 23:07:51.17	2025-11-07 23:07:51.17	\N	\N	f
15	Bruno Matias	Monges Arias	brunomonges0@gmail.com	\N	\N	\N	\N	2025-11-07 23:07:51.179	2025-11-07 23:07:51.179	\N	\N	f
16	Jacqueline	Ibañez Escurra	ibanezjacqueline11@gmail.com	\N	\N	\N	\N	2025-11-07 23:07:51.19	2025-11-07 23:07:51.19	\N	\N	f
17	Sebastian	Mendoza	mendosanseb@gmail.com	\N	\N	\N	\N	2025-11-07 23:07:51.199	2025-11-07 23:07:51.199	\N	\N	f
5	Santiago Josué	Cruz Valdez	santiagojosuecruz2011@gmail.com	0976120549	Isla Aranda - Limpio	Piano Clásico	Teoría I, Instrumento, Ensamble	2025-10-02 20:08:14.321	2025-10-02 20:08:14.321	Carolina Arce 	09814293925	f
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
1	80	2025-11-07 23:07:51.417	3	1
2	80	2025-11-07 23:07:51.422	4	2
3	80	2025-11-07 23:07:51.426	5	3
4	80	2025-11-07 23:07:51.434	6	4
5	80	2025-11-07 23:07:51.442	7	5
6	80	2025-11-07 23:07:51.448	8	6
7	80	2025-11-07 23:07:51.455	9	7
8	80	2025-11-07 23:07:51.462	10	8
9	80	2025-11-07 23:07:51.468	2	9
10	80	2025-11-07 23:07:51.473	1	10
11	80	2025-11-07 23:07:51.48	16	11
12	80	2025-11-07 23:07:51.485	17	12
13	0	2025-11-07 23:07:51.578	3	13
14	0	2025-11-07 23:07:51.581	4	14
15	0	2025-11-07 23:07:51.583	5	15
16	0	2025-11-07 23:07:51.586	6	16
17	0	2025-11-07 23:07:51.589	7	17
18	0	2025-11-07 23:07:51.592	8	18
19	0	2025-11-07 23:07:51.595	9	19
20	0	2025-11-07 23:07:51.601	10	20
21	0	2025-11-07 23:07:51.606	2	21
22	0	2025-11-07 23:07:51.61	1	22
23	0	2025-11-07 23:07:51.615	16	23
24	0	2025-11-07 23:07:51.618	17	24
25	0	2025-11-07 23:07:51.622	11	25
26	0	2025-11-07 23:07:51.626	12	26
27	0	2025-11-07 23:07:51.631	13	27
28	0	2025-11-07 23:07:51.634	14	28
29	0	2025-11-07 23:07:51.637	15	29
30	0	2025-11-07 23:07:51.643	11	30
31	0	2025-11-07 23:07:51.647	12	31
32	0	2025-11-07 23:07:51.649	13	32
33	0	2025-11-07 23:07:51.652	14	33
34	0	2025-11-07 23:07:51.655	15	34
\.


--
-- Data for Name: Catedra; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."Catedra" (id, nombre, anio, institucion, turno, aula, dias, created_at, updated_at, "docenteId", modalidad_pago) FROM stdin;
1	Introducción a la Filosofía	2025	Conservatorio Nacional de Música	Tarde	Aula 201	Jueves	2025-11-07 23:07:51.073	2025-11-07 23:07:51.073	1	PARTICULAR
2	Historia de la Música del Paraguay	2025	Conservatorio Nacional de Música	Mañana	Aula 101	Jueves	2025-11-07 23:07:51.084	2025-11-07 23:07:51.084	1	PARTICULAR
\.


--
-- Data for Name: CatedraAlumno; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."CatedraAlumno" ("catedraId", "alumnoId", "assignedAt", "assignedBy", "composerId", id, dia_cobro, fecha_inscripcion) FROM stdin;
2	3	2025-11-07 23:07:51.094	Julio Franco	\N	1	\N	2025-11-07 23:07:51.093
2	4	2025-11-07 23:07:51.102	Julio Franco	\N	2	\N	2025-11-07 23:07:51.101
2	5	2025-11-07 23:07:51.107	Julio Franco	\N	3	\N	2025-11-07 23:07:51.106
2	6	2025-11-07 23:07:51.111	Julio Franco	\N	4	\N	2025-11-07 23:07:51.11
2	7	2025-11-07 23:07:51.116	Julio Franco	\N	5	\N	2025-11-07 23:07:51.115
2	8	2025-11-07 23:07:51.119	Julio Franco	\N	6	\N	2025-11-07 23:07:51.118
2	9	2025-11-07 23:07:51.123	Julio Franco	\N	7	\N	2025-11-07 23:07:51.122
2	10	2025-11-07 23:07:51.127	Julio Franco	\N	8	\N	2025-11-07 23:07:51.126
2	2	2025-11-07 23:07:51.131	Julio Franco	\N	9	\N	2025-11-07 23:07:51.13
2	1	2025-11-07 23:07:51.135	Julio Franco	\N	10	\N	2025-11-07 23:07:51.134
1	11	2025-11-07 23:07:51.147	Julio Franco	\N	11	\N	2025-11-07 23:07:51.146
1	12	2025-11-07 23:07:51.156	Julio Franco	\N	12	\N	2025-11-07 23:07:51.155
1	13	2025-11-07 23:07:51.166	Julio Franco	\N	13	\N	2025-11-07 23:07:51.164
1	14	2025-11-07 23:07:51.175	Julio Franco	\N	14	\N	2025-11-07 23:07:51.174
1	15	2025-11-07 23:07:51.185	Julio Franco	\N	15	\N	2025-11-07 23:07:51.185
2	16	2025-11-07 23:07:51.196	Julio Franco	\N	16	\N	2025-11-07 23:07:51.195
2	17	2025-11-07 23:07:51.205	Julio Franco	\N	17	\N	2025-11-07 23:07:51.204
1	2	2025-11-08 02:03:16.065	ADMIN_SYSTEM	\N	18	5	2025-11-08 02:03:16.065
\.


--
-- Data for Name: CatedraDiaHorario; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."CatedraDiaHorario" (id, dia_semana, hora_inicio, hora_fin, "catedraId", created_at, updated_at) FROM stdin;
1	Jueves	16:00	17:00	1	2025-11-07 23:07:51.079	2025-11-07 23:07:51.079
2	Jueves	17:00	18:00	2	2025-11-07 23:07:51.087	2025-11-07 23:07:51.087
\.


--
-- Data for Name: ComentarioPublicacion; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."ComentarioPublicacion" (id, texto, "publicacionId", "autorAlumnoId", "autorDocenteId", created_at, updated_at) FROM stdin;
1	a	2	\N	1	2025-11-08 15:32:56.98	2025-11-08 15:32:56.979
3	Adelante!!!	1	\N	1	2025-11-08 23:08:30.673	2025-11-08 23:08:30.671
\.


--
-- Data for Name: Comment; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."Comment" (id, text, "composerId", created_at, ip_address, name) FROM stdin;
1	Mi favorito!	2	2025-11-08 17:14:32.883	::ffff:127.0.0.1	Julio Franco
\.


--
-- Data for Name: Composer; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."Composer" (id, bio, birth_day, birth_month, birth_year, created_at, death_day, death_month, death_year, email, first_name, ip_address, last_name, notable_works, photo_url, quality, "references", status, updated_at, youtube_link, period, "mainRole", completeness_score, rejection_reason, is_student_contribution, student_first_name, student_last_name, suggestion_reason) FROM stdin;
1	Originario de Nápoles, Italia. Trabajó en las Reducciones de San Ignacio del Paraná entre 1610 y 1640. Despertó entusiasmo en Buenos Aires en 1628 al presentar un grupo de veinte indios, diestros cantores y músicos de vihuelas de arco y otros instrumentos.	1	1	1595	2025-11-07 23:07:51.211	1	1	1664	seed_user_0_1762556871209@example.com	Pedro	127.0.0.1	Comentale	N/A (Se menciona su trabajo formando músicos indígenas).		A		PUBLISHED	2025-11-07 23:07:51.209		COLONIAL	{COMPOSER,PERFORMER}	\N	\N	f	\N	\N	\N
2	Nació en Tournay, Bélgica. Fue maestro de capilla de la corte de Carlos V antes de llegar a América. Arribó a las reducciones en 1617, trabajando intensamente en la Misión de Loreto hasta 1623.	1	1	1584	2025-11-07 23:07:51.215	1	1	1623	seed_user_1_1762556871209@example.com	Jean Vaisseau (Juan	127.0.0.1	Vaseo)	Trajo consigo no pocas piezas de música.		A		PUBLISHED	2025-11-07 23:07:51.209		COLONIAL	{PERFORMER}	\N	\N	f	\N	\N	\N
3	Originario de Abbeville, Amiens, Francia. Llegó al Paraguay en 1616. Desarrolló una valiosa labor docente en las reducciones jesuíticas de San Ignacio, Misiones. Enseñó a los indígenas a pintar y ejecutar instrumentos musicales.	1	1	1588	2025-11-07 23:07:51.219	1	1	1639	seed_user_2_1762556871209@example.com	Luis Berger (Louis	127.0.0.1	Berger)	N/A.		A		PUBLISHED	2025-11-07 23:07:51.209		COLONIAL	{PERFORMER}	\N	\N	f	\N	\N	\N
4	Músico de origen tirolés que llegó a las Reducciones Jesuíticas en 1616, estableciéndose en Yapeyú. Integró el Coro de la Corte Imperial en Viena. Ejecutaba más de 20 instrumentos y fue de los primeros en introducir el arpa en Paraguay.	1	1	1655	2025-11-07 23:07:51.222	1	1	1733	seed_user_3_1762556871209@example.com	Anton Sepp (Joseph Von	127.0.0.1	Reineg)	Fue compositor (no se especifican títulos).		A		PUBLISHED	2025-11-07 23:07:51.209		COLONIAL	{COMPOSER,PERFORMER}	\N	\N	f	\N	\N	\N
5	Nacido en Prato, Italia. Fue el compositor más destacado de su tiempo en Roma y organista de la Chiesa del Gesu. Llegó a América en 1717 y se estableció en Córdoba (Argentina). Su música se hizo muy apreciada por indígenas y misioneros en las reducciones. Su obra sudamericana fue mayormente redescubierta en Bolivia tras siglos de pérdida.	1	1	1688	2025-11-07 23:07:51.225	1	1	1726	seed_user_4_1762556871209@example.com	Domenico	127.0.0.1	Zipoli	De Europa: 'Sonate d’Intavolature per Órgano e Címbalo'. De América: 'Misa en fa', 'La Misa de los Santos Apóstoles', 'La Misa a San Ignacio', 'Letanía', 'Himno Te Deum Laudamus', 'Laudate Pueri'.		A		PUBLISHED	2025-11-07 23:07:51.209		COLONIAL	{COMPOSER,PERFORMER}	\N	\N	f	\N	\N	\N
6	Misionero músico y brillante arquitecto. Diseñó y dirigió la construcción de los principales templos de la reducción de Chiquitos (hoy Bolivia). También se dedicó a construir instrumentos.	1	1	1800	2025-11-07 23:07:51.229	\N	\N	\N	seed_user_5_1762556871209@example.com	Martin	127.0.0.1	Schmid	Creó numerosas obras para el repertorio musical.		A		PUBLISHED	2025-11-07 23:07:51.209		INDETERMINADO	{COMPOSER,PERFORMER}	\N	\N	f	\N	\N	\N
7	Clérigo virtuoso y pretendiente de la Compañía de Jesús. Fue el primer maestro de arte con que contaron los indios.	1	1	1800	2025-11-07 23:07:51.232	\N	\N	\N	seed_user_6_1762556871209@example.com	Rodrigo de	127.0.0.1	Melgarejo	N/A.		A		PUBLISHED	2025-11-07 23:07:51.209		INDETERMINADO	{PERFORMER}	\N	\N	f	\N	\N	\N
8	Maestro de Música que se destacó en la Escuela de Jóvenes Aprendices de Música Militar, fundada en la capital en 1817.	1	1	1800	2025-11-07 23:07:51.235	\N	\N	\N	seed_user_7_1762556871209@example.com	Manuel	127.0.0.1	Sierra	N/A.		A		PUBLISHED	2025-11-07 23:07:51.209		INDETERMINADO	{CONDUCTOR}	\N	\N	f	\N	\N	\N
9	Hermano de Felipe González, de nacionalidad argentina. Contratado en 1820 por el gobierno de Francia como instructor de bandas de música militar. Recontratado en 1853 por C. A. López.	1	1	1800	2025-11-07 23:07:51.237	\N	\N	\N	seed_user_8_1762556871209@example.com	Benjamín	127.0.0.1	González	N/A.		A		PUBLISHED	2025-11-07 23:07:51.209		INDETERMINADO	{PERFORMER}	\N	\N	f	\N	\N	\N
10	Hermano de Benjamín González. Destacado en las bandas de la Capital. Colaborador de Francisco S. de Dupuis en la formación de nuevas agrupaciones.	1	1	1800	2025-11-07 23:07:51.24	\N	\N	\N	seed_user_9_1762556871209@example.com	Felipe González (Felipe Santiago	127.0.0.1	González)	N/A.		A		PUBLISHED	2025-11-07 23:07:51.209		INDETERMINADO	{PERFORMER}	\N	\N	f	\N	\N	\N
11	Director de la primera escuela pública del Paraguay. Músico hábil guitarrista y cantor. Confirmado como director de la Escuela Central de Primeras Letras en 1812. Dirigía conjuntos musicales.	1	1	1800	2025-11-07 23:07:51.243	1	1	1840	seed_user_10_1762556871209@example.com	José Gabriel	127.0.0.1	Téllez	N/A.		A		PUBLISHED	2025-11-07 23:07:51.209		INDEPENDENCIA	{PERFORMER}	\N	\N	f	\N	\N	\N
12	Considerado el primer maestro de música del Paraguay. Virtuoso de la guitarra, también relojero y docente. Sucedió a José Gabriel Téllez en la dirección de la escuela en 1843.	1	1	1800	2025-11-07 23:07:51.246	\N	\N	\N	seed_user_11_1762556871209@example.com	Antonio María Quintana (Luis María	127.0.0.1	Quintana)	Se le atribuye la música del himno de la Academia Literaria. Atribuida la música del Himno Patriótico (de Anastasio Rolón).		A		PUBLISHED	2025-11-07 23:07:51.209		INDETERMINADO	{PERFORMER,CONDUCTOR}	\N	\N	f	\N	\N	\N
13	Nacido en Carapeguá. Uno de los más hábiles intérpretes de la guitarra y cantor popular posterior a la Independencia (1811). Formó parte de la banda de músicos del Batallón Escolta.	1	1	1800	2025-11-07 23:07:51.248	\N	\N	\N	seed_user_12_1762556871209@example.com	Kangüe Herreros (Cangué	127.0.0.1	Herreros)	Se le atribuye la creación de la polca 'Campamento Cerro León' y la canción 'Che lucero aguai’y'.		A		PUBLISHED	2025-11-07 23:07:51.209		INDETERMINADO	{PERFORMER}	\N	\N	f	\N	\N	\N
14	Destacado guitarrista popular de la zona de Luque, hacia 1830.	1	1	1800	2025-11-07 23:07:51.25	\N	\N	\N	seed_user_13_1762556871209@example.com	Rufino	127.0.0.1	López	N/A.		A		PUBLISHED	2025-11-07 23:07:51.209		INDETERMINADO	{PERFORMER}	\N	\N	f	\N	\N	\N
15	Guitarrista popular de gran fama, en la zona de San Pedro, hacia 1830.	1	1	1800	2025-11-07 23:07:51.252	\N	\N	\N	seed_user_14_1762556871209@example.com	Ulpiano	127.0.0.1	López	N/A.		A		PUBLISHED	2025-11-07 23:07:51.209		INDETERMINADO	{PERFORMER}	\N	\N	f	\N	\N	\N
16	Guitarrista virtuoso de la zona de Carapeguá, destacado en las décadas de 1830 y 1840.	1	1	1800	2025-11-07 23:07:51.254	\N	\N	\N	seed_user_15_1762556871209@example.com	Tomás Miranda (Tomás	127.0.0.1	Carapeguá)	N/A.		A		PUBLISHED	2025-11-07 23:07:51.209		INDETERMINADO	{PERFORMER}	\N	\N	f	\N	\N	\N
17	Nació en Caraguatay. Es autor del primer Himno Patriótico del Paraguay, con letra original en guaraní, escrito hacia 1830.	1	1	1800	2025-11-07 23:07:51.256	\N	\N	\N	seed_user_16_1762556871209@example.com	Anastasio	127.0.0.1	Rolón	Primer Himno Patriótico del Paraguay (Tetã Purahéi).		A		PUBLISHED	2025-11-07 23:07:51.209		INDETERMINADO	{PERFORMER,POET}	\N	\N	f	\N	\N	\N
18	Maestro francés contratado en 1853 por C. A. López como Jefe de Música. Formó más de 20 agrupaciones musicales y fue maestro de los primeros músicos profesionales. Carácter despótico y rigurosa disciplina.	1	1	1813	2025-11-07 23:07:51.258	1	1	1861	seed_user_17_1762556871209@example.com	Francisco Sauvageot de	127.0.0.1	Dupuis	Presunto autor de la música del Himno Nacional del Paraguay y autor de una 'Marcha al Mariscal López'.		A		PUBLISHED	2025-11-07 23:07:51.209		INDEPENDENCIA	{COMPOSER,CONDUCTOR}	\N	\N	f	\N	\N	\N
19	Uno de los primeros músicos profesionales, discípulo de Dupuis. Integró orquestas en Buenos Aires tras ser prisionero en la Guerra de la Triple Alianza. Organizó la primera Orquesta Nacional subvencionada por el Estado en 1890.	1	1	1853	2025-11-07 23:07:51.259	1	1	1908	seed_user_18_1762556871209@example.com	Cantalicio	127.0.0.1	Guerrero	La paraguaya (habanera sinfónica), una Mazurca, y 'Canción guerrera' (1865). Realizó una transcripción del Himno Nacional.		A		PUBLISHED	2025-11-07 23:07:51.209		INDEPENDENCIA	{COMPOSER,PERFORMER,CONDUCTOR,ENSEMBLE_ORCHESTRA}	\N	\N	f	\N	\N	\N
20	Virtuoso de la trompeta a mediados del siglo XIX. Integraba la Banda de Músicos de la Capital hacia 1850.	1	1	1800	2025-11-07 23:07:51.262	\N	\N	\N	seed_user_19_1762556871209@example.com	Rudecindo	127.0.0.1	Morales	N/A.		A		PUBLISHED	2025-11-07 23:07:51.209		INDETERMINADO	{PERFORMER}	\N	\N	f	\N	\N	\N
21	Discípulo de Dupuis. Figura relevante en las décadas de 1850 al 60. Dirigió las primeras orquestas en la capital. Falleció en Humaitá en el frente de batalla, dirigiendo la banda militar durante un bombardeo.	1	1	1830	2025-11-07 23:07:51.264	1	1	1865	seed_user_20_1762556871209@example.com	Indalecio	127.0.0.1	Odriozola	N/A.		A		PUBLISHED	2025-11-07 23:07:51.209		INDEPENDENCIA	{CONDUCTOR,ENSEMBLE_ORCHESTRA}	\N	\N	f	\N	\N	\N
22	Poeta uruguayo, autor del Himno Nacional del Uruguay. Creó el texto del actual Himno Nacional Paraguayo, entregado en 1840.	1	1	1800	2025-11-07 23:07:51.266	\N	\N	\N	seed_user_21_1762556871209@example.com	Francisco Acuña de	127.0.0.1	Figueroa	Texto del Himno Nacional Paraguayo; Himno Nacional del Uruguay.		A		PUBLISHED	2025-11-07 23:07:51.209		INDETERMINADO	{POET}	\N	\N	f	\N	\N	\N
23	Músico húngaro radicado en el Uruguay. Figura entre los presuntos autores de la música del Himno Nacional Paraguayo.	1	1	1800	2025-11-07 23:07:51.269	\N	\N	\N	seed_user_22_1762556871209@example.com	Francisco José	127.0.0.1	Debali	Autor del Himno de Uruguay.		A		PUBLISHED	2025-11-07 23:07:51.209		INDETERMINADO	{COMPOSER}	\N	\N	f	\N	\N	\N
24	Músico italiano. Figura entre los presuntos autores de la música del Himno Nacional Paraguayo.	1	1	1800	2025-11-07 23:07:51.271	\N	\N	\N	seed_user_23_1762556871209@example.com	José	127.0.0.1	Giuffra	N/A.		A		PUBLISHED	2025-11-07 23:07:51.209		INDETERMINADO	{COMPOSER}	\N	\N	f	\N	\N	\N
25	Músico italiano que llegó a Paraguay en 1874.	1	1	1800	2025-11-07 23:07:51.274	\N	\N	\N	seed_user_24_1762556871209@example.com	Luis	127.0.0.1	Cavedagni	Realizó la primera reconstrucción del Himno Nacional, publicada en su 'Álbum de los Toques más Populares del Paraguay' (1874).		A		PUBLISHED	2025-11-07 23:07:51.209		INDETERMINADO	{PERFORMER}	\N	\N	f	\N	\N	\N
26	Maestro de Agustín Pío Barrios Mangoré. Dirigió la orquesta que acompañó a Mangoré en 1908. Co-fundador de la zarzuela paraguaya con la obra 'Tierra Guaraní' (1913). Dirigió la Banda de la Policía de la Capital.	1	1	1800	2025-11-07 23:07:51.278	\N	\N	\N	seed_user_25_1762556871209@example.com	Nicolino	127.0.0.1	Pellegrini	Tierra Guaraní (zarzuela, 1913). Versión del Himno Nacional (1922).		A		PUBLISHED	2025-11-07 23:07:51.209		INDETERMINADO	{COMPOSER,CONDUCTOR}	\N	\N	f	\N	\N	\N
27	El más universal de los músicos paraguayos. Estudió con Sosa Escalada y Nicolino Pellegrini. Realizó extensas giras por América y Europa. Desarrolló tres estilos: barroco, romántico y folklórico hispanoamericano. Considerado genio nacional en El Salvador.	1	1	1885	2025-11-07 23:07:51.281	1	1	1944	seed_user_26_1762556871209@example.com	Agustín Pío Barrios	127.0.0.1	Mangoré	'Las Abejas', 'Danza Paraguaya', 'Estudio de Concierto', 'Mazurca, Apasionata', 'La Catedral', 'Valses 3 y 4', 'Choro de Saudade' (1929), 'Julia Florida' (1938), 'Una limosna por amor de Dios', 'Kyguá Verá'.		A		PUBLISHED	2025-11-07 23:07:51.209		POSGUERRA	{COMPOSER,PERFORMER}	\N	\N	f	\N	\N	\N
28	La figura más importante de la música popular paraguaya del siglo XX. Creó la 'Guarania' en 1925. Fue un pionero en la búsqueda de un lenguaje nacional en el campo sinfónico.	1	1	1904	2025-11-07 23:07:51.285	1	1	1972	seed_user_27_1762556871209@example.com	José Asunción	127.0.0.1	Flores	Guaranias: 'Jejuí' (la primera), 'India', 'Kerasy', 'Ne rendápe aju', 'Panambí verá', 'Ñemity'. Poemas Sinfónicos: 'Mburikaó', 'Pyhare Pyte' (1954), 'Ñanderuvusu' (1957), 'María de la Paz' (1961).		A		PUBLISHED	2025-11-07 23:07:51.209		POSGUERRA	{COMPOSER}	\N	\N	f	\N	\N	\N
29	Dirigió la orquesta del Comando del Ejército durante la Guerra del Chaco. Incursionó en la composición sinfónica y creó música para filmes argentinos. Su música 'Cerro Corá' fue declarada Canción Nacional en 1944.	1	1	1905	2025-11-07 23:07:51.289	1	1	1991	seed_user_28_1762556871209@example.com	Herminio	127.0.0.1	Giménez	Obras sinfónicas: 'El Rabelero' (1944), 'Suite El Pájaro' (1950), 'Sinfonía en Gris Mayor' (1990). Populares: 'El canto de mi selva', 'Che Trompo arasá', 'Cerro Corá' (1931), 'Cerro Porteño' (1936).		A		PUBLISHED	2025-11-07 23:07:51.209		POSGUERRA	{COMPOSER,CONDUCTOR}	\N	\N	f	\N	\N	\N
30	Músico de más alta formación académica del Paraguay, estudió becado en Brasil. Creó la Orquesta Sinfónica de la Asociación de Músicos del Paraguay (1951).	1	1	1914	2025-11-07 23:07:51.292	1	1	1987	seed_user_29_1762556871209@example.com	Carlos Lara	127.0.0.1	Bareiro	Obras sinfónicas: 'Suite Paraguaya Nº 1 y 2', 'Concierto para piano y orquesta', 'Gran Guarania en Do mayor', 'Guarania Sinfónica'. Para piano: 'Acuarelas Paraguayas'.		A		PUBLISHED	2025-11-07 23:07:51.209		POSGUERRA	{COMPOSER,CONDUCTOR}	\N	\N	f	\N	\N	\N
31	Estudió en la Banda de Músicos de los Salesianos y formó su gran orquesta típica. Se estableció en Venezuela (1952) como músico y docente.	1	1	1910	2025-11-07 23:07:51.296	1	1	1969	seed_user_30_1762556871209@example.com	Emilio	127.0.0.1	Biggi	Poema sinfónico 'Renacer Guaraní' (1957). 'Cuarteto de cuerdas' (1953), 'Aire Nacional Op.3' (1953). Populares: 'Paraguay', 'Mimby pú', 'Acosta ñu', 'Cordión jahe’o'.		A		PUBLISHED	2025-11-07 23:07:51.209		POSGUERRA	{COMPOSER,PERFORMER}	\N	\N	f	\N	\N	\N
32	Se graduó de Doctor en Medicina en Buenos Aires. Pionero en musicología y rescate de música indígena. Autor de importantes estudios y libros como 'Música y músicos del Paraguay'.	1	1	1899	2025-11-07 23:07:51.301	1	1	1958	seed_user_31_1762556871209@example.com	Juan Max	127.0.0.1	Boettner	'Suite guaraní' (orquesta), 'Sinfonía en Mi menor', Ballet 'El sueño de René'. Canciones: 'Azul luna', 'Nostalgia guaraní'.		A		PUBLISHED	2025-11-07 23:07:51.209		POSGUERRA	{COMPOSER}	\N	\N	f	\N	\N	\N
33	Superó un accidente en la niñez que le costó ambas piernas. Estudió becado en Brasil. Junto a Manuel Frutos Pane, creó el género de la 'Zarzuela Paraguaya' (1956). Director del Conservatorio Municipal de Música.	1	1	1916	2025-11-07 23:07:51.304	1	1	1983	seed_user_32_1762556871209@example.com	Juan Carlos Moreno	127.0.0.1	González	Zarzuelas: 'La tejedora de Ñandutí' (1956), 'Corochire' (1958), 'María Pacuri' (1959). Sinfónico: Poema 'Kuarahy mimby' (1944). Canciones: 'Margarita' (1929).		A		PUBLISHED	2025-11-07 23:07:51.209		POSGUERRA	{COMPOSER,CONDUCTOR}	\N	\N	f	\N	\N	\N
34	Estudió en Argentina y se perfeccionó en París y Berlín. Reconstruyó la versión oficial del Himno Nacional Paraguayo (1934). Fundó la Escuela Normal de Música (1940) y la Orquesta Sinfónica de la Ciudad de Asunción (OSCA) (1957).	1	1	1898	2025-11-07 23:07:51.306	1	1	1977	seed_user_33_1762556871209@example.com	Remberto	127.0.0.1	Giménez	'Rapsodia Paraguaya' (1932 y 1954). 'Nostalgias del Terruño', 'Ka´aguy Ryakuä', 'Marcha Presidencial' (1938). 'Himno a la Juventud'.		A		PUBLISHED	2025-11-07 23:07:51.209		POSGUERRA	{COMPOSER,CONDUCTOR}	\N	\N	f	\N	\N	\N
35	Hábil ejecutante del bandoneón. Formó su propia Orquesta Típica (1925) y dirigió la Orquesta Gigante de la Asociación de Músicos del Paraguay (1938). Fundador y docente de la Escuela de Música de APA.	1	1	1905	2025-11-07 23:07:51.308	1	1	1985	seed_user_34_1762556871209@example.com	Luis	127.0.0.1	Cañete	'Jahe´o soro' (canción, 1925), 'Sueño de Artista' (poema sinfónico, 1938), 'Divertimento para cuerdas' (1938), 'Patria mía' (poema sinfónico, 1952), 'Asunción de antaño' (poema sinfónico, 1953).		A		PUBLISHED	2025-11-07 23:07:51.209		POSGUERRA	{COMPOSER,PERFORMER}	\N	\N	f	\N	\N	\N
36	Director de la OSCA (1976-1990) y director invitado en varios países. Fundó el Conservatorio Nacional de Música (1997). Autor de la primera ópera paraguaya 'Juana de Lara'. Recibió el Premio Nacional de Música en 2001.	1	1	1925	2025-11-07 23:07:51.31	\N	\N	\N	seed_user_35_1762556871209@example.com	Florentín	127.0.0.1	Giménez	Ópera 'Juana de Lara' (1987). 6 Sinfonías (1980-1994). Poemas sinfónicos: 'Minas Cué' (1970), 'El Río de la Esperanza' (1972). Comedia musical 'Sombrero piri'. Canción 'Así Canta mi Patria'.		A		PUBLISHED	2025-11-07 23:07:51.209		MODERNO	{COMPOSER,CONDUCTOR}	\N	\N	f	\N	\N	\N
37	Se dedicó fundamentalmente a la composición de música de inspiración folklórica. Integró el dúo Martínez-Cardozo con Eladio Martínez. Estudió folklore con Juan Alfonso Carrizo. Fundador de SADAIC (Argentina). Autor del libro 'Mundo Folklórico Paraguayo'.	1	1	1907	2025-11-07 23:07:51.314	1	1	1982	seed_user_36_1762556871209@example.com	Mauricio Cardozo	127.0.0.1	Ocampo	Alrededor de 300 canciones. 'Las siete cabrillas', 'Pueblo Ybycuí', 'Añoranza', 'Paraguaya linda', 'Guavirá poty', 'Galopera'.		A		PUBLISHED	2025-11-07 23:07:51.209		POSGUERRA	{COMPOSER,PERFORMER}	\N	\N	f	\N	\N	\N
38	Se radicó en Buenos Aires, participando activamente en la Agrupación Folklórica Guaraní. Estudió armonía y composición con Gilardo Gilardi. Fue director de la orquesta de la Agrupación Folklórica Guaraní.	1	1	1903	2025-11-07 23:07:51.316	1	1	1957	seed_user_37_1762556871209@example.com	Francisco Alvarenga	127.0.0.1	(Nenin)	'Carne de cañón', 'Chokokue purahéi', 'Meditación', versión sinfónica de 'Campamento Cerro León', 'Plata yvyguy'.		A		PUBLISHED	2025-11-07 23:07:51.209		POSGUERRA	{COMPOSER,CONDUCTOR}	\N	\N	f	\N	\N	\N
39	Inició su carrera junto a Herminio Giménez. Integró el célebre Trío Olímpico (1948) con Eladio Martínez y Albino Quiñonez. Su canción 'Mi dicha lejana' le dio gran popularidad.	1	1	1917	2025-11-07 23:07:51.318	1	1	1993	seed_user_38_1762556871209@example.com	Emigdio Ayala	127.0.0.1	Báez	'Polca del Club Sol de América', 'Mi dicha lejana', 'Lejana flor', 'Oración a mi amada' (co-autoría), 'A mi pueblito Escobar'.		A		PUBLISHED	2025-11-07 23:07:51.209		POSGUERRA	{COMPOSER,PERFORMER}	\N	\N	f	\N	\N	\N
40	Se estableció en Buenos Aires, siendo solista de orquestas importantes. Participó en la grabación del primer disco de José Asunción Flores (1934). Obtuvo el Premio Nacional de Música por 'Mi patria soñada' (1997).	1	1	1913	2025-11-07 23:07:51.32	1	1	1997	seed_user_39_1762556871209@example.com	Agustín	127.0.0.1	Barboza	'Alma Vibrante', 'Flor de Pilar', 'Mi patria soñada', 'Sobre el corazón de mi guitarra', 'Dulce tierra mía' (con A. Roa Bastos), 'Reservista purahéi' (con F. Fernández).		A		PUBLISHED	2025-11-07 23:07:51.209		POSGUERRA	{COMPOSER,PERFORMER}	\N	\N	f	\N	\N	\N
41	Estudió en la Banda de Músicos del Colegio Salesiano. Creó la orquesta 'Los Caballeros del Ritmo'. Desarrolló una importante labor en la creación de zarzuelas paraguayas a partir de 1960.	1	1	1923	2025-11-07 23:07:51.322	\N	\N	\N	seed_user_40_1762556871209@example.com	Neneco Norton (Elio Ramón Benítez	127.0.0.1	González)	Posee 84 composiciones. Polca 'Paloma Blanca' (difusión mundial). Guaranias: 'Aquel ayer', 'Resedá'. Zarzuelas: 'El arribeño', 'Ribereña', 'Naranjera'.		A		PUBLISHED	2025-11-07 23:07:51.209		MODERNO	{COMPOSER,PERFORMER,CONDUCTOR}	\N	\N	f	\N	\N	\N
42	Ganó el Primer Premio en el Concurso Nacional de Canto (1930). Formó el célebre dúo Martínez-Cardozo. Dirigió programas radiales de música paraguaya en Argentina. Integró el Trío Olímpico. Musicalizó la película 'El trueno entre las hojas'.	1	1	1912	2025-11-07 23:07:51.324	1	1	1990	seed_user_41_1762556871209@example.com	Eladio	127.0.0.1	Martínez	'Lucerito alba', 'Noches guaireñas', 'Che pycasumi', 'Pacholí' (zarzuela). Co-autor de 'Oración a mi amada' y 'Lejana flor'.		A		PUBLISHED	2025-11-07 23:07:51.209		POSGUERRA	{COMPOSER,PERFORMER}	\N	\N	f	\N	\N	\N
43	Formó el Trío Asunceno (1943) con Ignacio Melgarejo y Digno García. Se hizo famoso internacionalmente con su canción 'Mis noches sin ti', dedicada a su madre recién fallecida.	1	1	1916	2025-11-07 23:07:51.328	1	1	1975	seed_user_42_1762556871209@example.com	Demetrio	127.0.0.1	Ortíz	'Recuerdos de Ypacaraí', 'Mis noches sin ti', 'Que será de ti', 'Mi canción viajera'.		A		PUBLISHED	2025-11-07 23:07:51.209		POSGUERRA	{COMPOSER,PERFORMER}	\N	\N	f	\N	\N	\N
44	Figura más relevante en la interpretación y desarrollo técnico del arpa paraguaya. Inició su carrera como autodidacta. Amplió los recursos técnicos del arpa y aumentó el número de cuerdas. Su pueblo natal lleva su nombre actualmente.	1	1	1908	2025-11-07 23:07:51.332	1	1	1952	seed_user_43_1762556871209@example.com	Félix Pérez	127.0.0.1	Cardozo	Versión de la polca 'Guyra Campana' (Pájaro campana, recopilación). 'Llegada', 'Tren lechero', 'Che valle mi Yaguarón', 'Los sesenta granaderos', 'Oda pasional'.		A		PUBLISHED	2025-11-07 23:07:51.209		POSGUERRA	{COMPOSER,PERFORMER}	\N	\N	f	\N	\N	\N
45	Estudió en Brasil. Creador del género 'Avanzada' (1977), que fusiona guarania y polca con ritmos modernos e instrumentos electrónicos.	1	1	1943	2025-11-07 23:07:51.335	\N	\N	\N	seed_user_44_1762556871209@example.com	Oscar Nelson	127.0.0.1	Safuán	'Tema paraguayo' (1977), 'Avanzada', 'Paraguay 80', 'Nacionales 1, 2 y 3'.		A		PUBLISHED	2025-11-07 23:07:51.209		MODERNO	{COMPOSER}	\N	\N	f	\N	\N	\N
46	Formó parte del movimiento del Nuevo Cancionero Latinoamericano en Paraguay. Destacado por sus textos de aguda visión, ironía y compromiso social. Fue periodista y profesor de música.	1	1	1945	2025-11-07 23:07:51.34	1	1	1980	seed_user_45_1762556871209@example.com	Maneco Galeano (Félix Roberto	127.0.0.1	Galeano)	'Yo soy de la Chacarita' (1971), 'Despertar' (1973), 'La Chuchi' (1970), 'Los problemas que acarrea un televisor...', 'Poncho de 60 listas' (1980), 'Ceferino Zarza compañero' (con Jorge Garbett).		A		PUBLISHED	2025-11-07 23:07:51.209		MODERNO	{COMPOSER}	\N	\N	f	\N	\N	\N
47	Compositor que creó varias composiciones dentro del género 'Avanzada'.	1	1	1800	2025-11-07 23:07:51.344	\N	\N	\N	seed_user_46_1762556871209@example.com	Papi	127.0.0.1	Galán	Composiciones en género Avanzada.		A		PUBLISHED	2025-11-07 23:07:51.209		INDETERMINADO	{COMPOSER}	\N	\N	f	\N	\N	\N
48	Compositor que creó varias composiciones dentro del género 'Avanzada'.	1	1	1800	2025-11-07 23:07:51.347	\N	\N	\N	seed_user_47_1762556871209@example.com	Vicente	127.0.0.1	Castillo	Composiciones en género Avanzada.		A		PUBLISHED	2025-11-07 23:07:51.209		INDETERMINADO	{COMPOSER}	\N	\N	f	\N	\N	\N
49	Compositor que creó varias composiciones dentro del género 'Avanzada'.	1	1	1800	2025-11-07 23:07:51.35	\N	\N	\N	seed_user_48_1762556871209@example.com	Luis	127.0.0.1	Bordón	Composiciones en género Avanzada.		A		PUBLISHED	2025-11-07 23:07:51.209		INDETERMINADO	{COMPOSER}	\N	\N	f	\N	\N	\N
50	Representante destacado del movimiento del Nuevo Cancionero en Paraguay.	1	1	1800	2025-11-07 23:07:51.352	\N	\N	\N	seed_user_49_1762556871209@example.com	Carlos	127.0.0.1	Noguera	'Canto de esperanza', 'A la residenta', 'Hazme un sitio a tu lado', 'El silencio y la aurora'.		A		PUBLISHED	2025-11-07 23:07:51.209		INDETERMINADO	{COMPOSER}	\N	\N	f	\N	\N	\N
51	Representante destacado del movimiento del Nuevo Cancionero en Paraguay.	1	1	1800	2025-11-07 23:07:51.354	\N	\N	\N	seed_user_50_1762556871209@example.com	Jorge	127.0.0.1	Garbett	'Ceferino Zarza compañero' (con Maneco Galeano), 'Los hombres' (marcha), 'Para vivir'.		A		PUBLISHED	2025-11-07 23:07:51.209		INDETERMINADO	{COMPOSER}	\N	\N	f	\N	\N	\N
52	Representante destacado e intérprete del movimiento del Nuevo Cancionero.	1	1	1800	2025-11-07 23:07:51.356	\N	\N	\N	seed_user_51_1762556871209@example.com	Alberto	127.0.0.1	Rodas	'Torres de babel', 'Sudor de pobre', 'Tenemos tanto', 'Mundo loco'.		A		PUBLISHED	2025-11-07 23:07:51.209		INDETERMINADO	{COMPOSER}	\N	\N	f	\N	\N	\N
53	Representante destacado del movimiento del Nuevo Cancionero en Paraguay.	1	1	1800	2025-11-07 23:07:51.358	\N	\N	\N	seed_user_52_1762556871209@example.com	Rolando	127.0.0.1	Chaparro	'Polcaza', 'Polcarera de los lobos', 'Un misil en mi ventana', 'Ojavea'.		A		PUBLISHED	2025-11-07 23:07:51.209		INDETERMINADO	{COMPOSER}	\N	\N	f	\N	\N	\N
54	Soluta voluptatem e	27	11	2006	2025-11-08 17:34:17.212	5	11	1990	jucfra23@gmail.com	Echo	\N	Cline	Iusto eos facere ali	data:image/jpeg;base64,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	\N	\N	PENDING_REVIEW	2025-11-08 17:34:17.212	\N	COLONIAL	{POET,CONDUCTOR,PERFORMER,ENSEMBLE_ORCHESTRA}	\N	\N	f	\N	\N	\N
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
1	2025-11-06 00:00:00	Jueves	2025-11-10 22:43:03.847	2025-11-10 22:43:03.846	1
2	2025-07-31 00:00:00	Jueves	2025-11-10 22:49:42.302	2025-11-10 22:49:42.301	1
3	2025-08-07 00:00:00	Jueves	2025-11-10 22:50:00.594	2025-11-10 22:50:00.593	1
4	2025-08-14 00:00:00	Jueves	2025-11-10 22:50:35.877	2025-11-10 22:50:35.876	1
5	2025-08-21 00:00:00	Jueves	2025-11-10 22:51:34.6	2025-11-10 22:51:34.598	1
6	2025-08-28 00:00:00	Jueves	2025-11-10 22:52:19.861	2025-11-10 22:52:19.859	1
7	2025-09-04 00:00:00	Jueves	2025-11-10 22:52:37.319	2025-11-10 22:52:37.318	1
8	2025-09-11 00:00:00	Jueves	2025-11-10 22:52:57.919	2025-11-10 22:52:57.918	1
9	2025-09-18 00:00:00	Jueves	2025-11-11 00:25:41.596	2025-11-11 00:25:41.594	1
\.


--
-- Data for Name: Docente; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."Docente" (id, nombre, apellido, email, "otpSecret", "otpEnabled", created_at, updated_at, direccion, telefono) FROM stdin;
1	Julio	Franco	jucfra23@gmail.com	FQUHKZL5FQVEGJLXKM3TSQ3BIZ3ECRTL	t	2025-11-07 23:07:51.066	2025-11-07 23:07:51.066	Laurelty 4565, Luque - Paraguay	0981574711
\.


--
-- Data for Name: EditSuggestion; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."EditSuggestion" (id, first_name, last_name, birth_year, birth_month, birth_day, death_year, death_month, death_day, bio, notable_works, period, "references", youtube_link, "mainRole", reason, status, suggester_email, suggester_ip, created_at, updated_at, "composerId", is_student_contribution, student_first_name, student_last_name, points, photo_url) FROM stdin;
1	Jean Vaisseau (Juan	Vaseo)	1584	1	1	1623	1	1	Nació en Tournay, Bélgica. Fue maestro de capilla de la corte de Carlos V antes de llegar a América. Arribó a las reducciones en 1617, trabajando intensamente en la Misión de Loreto hasta 1623.	Trajo consigo no pocas piezas de música.	COLONIAL	\N	\N	{PERFORMER}	Correcciones	PENDING_REVIEW	jucfra23@gmail.com	::ffff:127.0.0.1	2025-11-08 17:25:09.028	2025-11-08 17:25:09.028	2	f	\N	\N	0	\N
2	Jean Vaisseau (Juan	Vaseo)	1584	1	1	1623	1	1	Nació en Tournay, Bélgica. Fue maestro de capilla de la corte de Carlos V antes de llegar a América. Arribó a las reducciones en 1617, trabajando intensamente en la Misión de Loreto hasta 1623.	Trajo consigo no pocas piezas de música.	COLONIAL	\N	\N	{PERFORMER}	TEst	PENDING_REVIEW	jucfra23@gmail.com	::ffff:127.0.0.1	2025-11-08 17:26:28.195	2025-11-08 17:26:28.195	2	f	\N	\N	0	\N
\.


--
-- Data for Name: Evaluacion; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."Evaluacion" (id, titulo, created_at, "catedraId", fecha_limite, "isMaster", "unidadPlanId") FROM stdin;
1	EVALUACIÓN 1ER. CUATRIMESTRE	2025-11-07 23:07:51.412	2	2025-06-30 23:59:59	t	7
2	EVALUACIÓN 1ER. CUATRIMESTRE Filosofía	2025-11-07 23:07:51.572	1	2025-06-30 23:59:59	t	24
3	Evaluación sobre el Periodo de Los López	2025-11-07 23:07:51.574	2	2025-07-15 23:59:59	t	8
4	Evaluación: El mundo del arte en el pensamiento filosófico	2025-11-07 23:07:51.619	1	2025-04-30 23:59:59	t	19
5	Evaluación: Nietzsche y la voluntad de poder como arte	2025-11-07 23:07:51.639	1	2025-07-30 23:59:59	t	26
19	Evaluación de Genera preguntas que coencten las unidades para Historia de la Música del Paraguay	2025-11-13 02:04:52.356	2	\N	t	\N
28	Evaluación de test para Historia de la Música del Paraguay	2025-11-13 02:50:08.884	2	\N	t	\N
30	Evaluación de test para Historia de la Música del Paraguay	2025-11-13 03:20:02.158	2	\N	t	\N
\.


--
-- Data for Name: EvaluacionAsignacion; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."EvaluacionAsignacion" (id, estado, fecha_entrega, created_at, updated_at, "alumnoId", "evaluacionId", "publicacionId") FROM stdin;
1	CALIFICADA	2025-06-30 23:59:59	2025-11-07 23:07:51.414	2025-11-07 23:07:51.414	3	1	\N
2	CALIFICADA	2025-06-30 23:59:59	2025-11-07 23:07:51.42	2025-11-07 23:07:51.42	4	1	\N
3	CALIFICADA	2025-06-30 23:59:59	2025-11-07 23:07:51.424	2025-11-07 23:07:51.424	5	1	\N
4	CALIFICADA	2025-06-30 23:59:59	2025-11-07 23:07:51.43	2025-11-07 23:07:51.43	6	1	\N
5	CALIFICADA	2025-06-30 23:59:59	2025-11-07 23:07:51.438	2025-11-07 23:07:51.438	7	1	\N
6	CALIFICADA	2025-06-30 23:59:59	2025-11-07 23:07:51.445	2025-11-07 23:07:51.445	8	1	\N
7	CALIFICADA	2025-06-30 23:59:59	2025-11-07 23:07:51.452	2025-11-07 23:07:51.452	9	1	\N
8	CALIFICADA	2025-06-30 23:59:59	2025-11-07 23:07:51.458	2025-11-07 23:07:51.458	10	1	\N
9	CALIFICADA	2025-06-30 23:59:59	2025-11-07 23:07:51.465	2025-11-07 23:07:51.465	2	1	\N
10	CALIFICADA	2025-06-30 23:59:59	2025-11-07 23:07:51.471	2025-11-07 23:07:51.471	1	1	\N
11	CALIFICADA	2025-06-30 23:59:59	2025-11-07 23:07:51.476	2025-11-07 23:07:51.476	16	1	\N
12	CALIFICADA	2025-06-30 23:59:59	2025-11-07 23:07:51.483	2025-11-07 23:07:51.483	17	1	\N
13	CALIFICADA	2025-07-15 23:59:59	2025-11-07 23:07:51.576	2025-11-07 23:07:51.576	3	3	\N
14	CALIFICADA	2025-07-15 23:59:59	2025-11-07 23:07:51.579	2025-11-07 23:07:51.579	4	3	\N
15	CALIFICADA	2025-07-15 23:59:59	2025-11-07 23:07:51.582	2025-11-07 23:07:51.582	5	3	\N
16	CALIFICADA	2025-07-15 23:59:59	2025-11-07 23:07:51.585	2025-11-07 23:07:51.585	6	3	\N
17	CALIFICADA	2025-07-15 23:59:59	2025-11-07 23:07:51.587	2025-11-07 23:07:51.587	7	3	\N
18	CALIFICADA	2025-07-15 23:59:59	2025-11-07 23:07:51.59	2025-11-07 23:07:51.59	8	3	\N
19	CALIFICADA	2025-07-15 23:59:59	2025-11-07 23:07:51.593	2025-11-07 23:07:51.593	9	3	\N
20	CALIFICADA	2025-07-15 23:59:59	2025-11-07 23:07:51.598	2025-11-07 23:07:51.598	10	3	\N
21	CALIFICADA	2025-07-15 23:59:59	2025-11-07 23:07:51.603	2025-11-07 23:07:51.603	2	3	\N
22	CALIFICADA	2025-07-15 23:59:59	2025-11-07 23:07:51.608	2025-11-07 23:07:51.608	1	3	\N
23	CALIFICADA	2025-07-15 23:59:59	2025-11-07 23:07:51.612	2025-11-07 23:07:51.612	16	3	\N
24	CALIFICADA	2025-07-15 23:59:59	2025-11-07 23:07:51.616	2025-11-07 23:07:51.616	17	3	\N
25	CALIFICADA	2025-04-30 23:59:59	2025-11-07 23:07:51.621	2025-11-07 23:07:51.621	11	4	\N
26	CALIFICADA	2025-04-30 23:59:59	2025-11-07 23:07:51.624	2025-11-07 23:07:51.624	12	4	\N
27	CALIFICADA	2025-04-30 23:59:59	2025-11-07 23:07:51.629	2025-11-07 23:07:51.629	13	4	\N
28	CALIFICADA	2025-04-30 23:59:59	2025-11-07 23:07:51.633	2025-11-07 23:07:51.633	14	4	\N
29	CALIFICADA	2025-04-30 23:59:59	2025-11-07 23:07:51.636	2025-11-07 23:07:51.636	15	4	\N
30	CALIFICADA	2025-07-30 23:59:59	2025-11-07 23:07:51.642	2025-11-07 23:07:51.642	11	5	\N
31	CALIFICADA	2025-07-30 23:59:59	2025-11-07 23:07:51.645	2025-11-07 23:07:51.645	12	5	\N
32	CALIFICADA	2025-07-30 23:59:59	2025-11-07 23:07:51.648	2025-11-07 23:07:51.648	13	5	\N
33	CALIFICADA	2025-07-30 23:59:59	2025-11-07 23:07:51.651	2025-11-07 23:07:51.651	14	5	\N
34	CALIFICADA	2025-07-30 23:59:59	2025-11-07 23:07:51.654	2025-11-07 23:07:51.654	15	5	\N
\.


--
-- Data for Name: Opcion; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."Opcion" (id, texto, es_correcta, "preguntaId") FROM stdin;
944	Unidad 5: La Independencia	f	243
945	Unidad 6: Los López	t	243
946	Unidad 9: Danzas Paraguayas	f	243
947	Unidad 13: Música Paraguaya	f	243
948	Mangoré y Flores	f	244
780	Para aislar conceptos y evitar confusiones.	f	201
781	Para simplificar el proceso de aprendizaje centrándose en detalles aislados.	f	201
782	Para comprender la relación entre diferentes conceptos y construir un conocimiento más sólido y coherente.	t	201
783	No es importante, cada unidad debe estudiarse de forma independiente.	f	201
784	Memorizar cada unidad por separado sin buscar patrones.	f	202
785	Ignorar las relaciones entre las unidades y enfocarse en el contenido individual.	f	202
786	Identificar temas recurrentes, comparar y contrastar conceptos, y crear mapas conceptuales.	t	202
787	Estudiar solo la primera y la última unidad para tener una visión general.	f	202
788	Un muro que separa cada bloque.	f	203
789	Un conjunto de bloques apilados sin ningún orden.	f	203
790	El pegamento que une los bloques para formar una estructura coherente y más grande.	t	203
791	Un desperdicio de tiempo, ya que cada bloque es independiente.	f	203
792	Reduce la capacidad de recordar información específica de cada unidad.	f	204
793	Dificulta la aplicación de conocimientos a situaciones nuevas.	f	204
794	Permite una mejor comprensión, retención y aplicación del conocimiento.	t	204
795	Aumenta el tiempo necesario para estudiar cada unidad individualmente.	f	204
796	Estudiar cada proceso por separado sin buscar similitudes o diferencias.	f	205
797	Ignorar que ambos procesos ocurren en las plantas.	f	205
798	Comprender que son procesos complementarios, uno genera lo que el otro consume (ciclo de energía).	t	205
799	Memorizar las ecuaciones químicas de cada proceso sin entender su relación.	f	205
949	Pedro Comentale y Domenico Zipoli	t	244
950	Giménez y Kyre’ŷ	f	244
951	Francia y los López	f	244
952	Compuesto	f	245
953	Jejuvykue Jerá	f	245
954	Polca	t	245
955	Estacioneros	f	245
956	Unidad 5	f	246
957	Unidad 7	t	246
958	Unidad 1	f	246
959	Unidad 16	f	246
960	Zarzuela Paraguaya	f	247
961	El Movimiento del Nuevo Cancionero	f	247
962	El Paraguay como provincia gigante	t	247
963	Músicos del siglo XX	f	247
984	Unidad 2: Los Indígenas y su Música	f	253
985	Unidad 1: Introducción (El Paraguay, Una provincia gigante, Integración política y cultural)	t	253
986	Unidad 5: La Independencia	f	253
987	Unidad 4: Las Misiones Jesuíticas	f	253
988	La Guerra de la Triple Alianza	f	254
989	La Independencia	f	254
990	Las Misiones Jesuíticas	t	254
991	Los López	f	254
992	Unidad 5: La Independencia	f	255
993	Unidad 6: Los López	t	255
994	Unidad 9: Danzas Paraguayas	f	255
995	Unidad 13: Música Paraguaya	f	255
996	Polca	f	256
997	Guarania	f	256
998	Kyre’ŷ	f	256
999	Sonata	t	256
1000	Unidad 15: Zarzuela Paraguaya	f	257
1001	Unidad 16: Compositores Paraguayos del Siglo XX	f	257
1002	Unidad 17: El Movimiento del Nuevo Cancionero en Paraguay	t	257
1003	Unidad 14: Agrupaciones Tradicionales	f	257
\.


--
-- Data for Name: Otp; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."Otp" (id, email, code, "expiresAt") FROM stdin;
11	santiagojosuevaldezcruz2011@gmail.com	263667	2025-11-12 20:13:23.048
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
1	PLAN ANUAL DE ESTUDIOS 2025 - Historia de la Música del Paraguay	MES	1	2	2025-11-07 23:07:51.359	2025-11-07 23:07:51.359
2	PLAN ANUAL DE ESTUDIOS 2025 - Introducción a la Filosofía	MES	1	1	2025-11-07 23:07:51.544	2025-11-07 23:07:51.544
\.


--
-- Data for Name: Pregunta; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."Pregunta" (id, texto, "evaluacionId") FROM stdin;
243	¿En qué unidad se introducen las primeras referencias sobre la Música Popular Paraguaya?	28
244	¿Quiénes fueron músicos destacados en las misiones jesuíticas, según el contenido?	28
245	¿Cuál de las siguientes opciones representa un género o estilo de música paraguaya popular mencionado en el contenido?	28
246	¿Qué unidad abarca el tema del Himno Nacional Paraguayo?	28
247	¿Cuál de los siguientes temas se aborda en la Unidad 1?	28
201	¿Por qué es importante conectar las unidades de estudio al aprender un nuevo tema?	19
202	¿Cuál de las siguientes estrategias ayuda a conectar las unidades de estudio de manera efectiva?	19
203	Considerando que cada unidad de estudio es un bloque, ¿qué representa la conexión entre las unidades?	19
204	¿Qué beneficio se obtiene al comprender cómo las diferentes unidades de estudio se relacionan entre sí?	19
205	Si en una unidad se aprende sobre la 'fotosíntesis' y en otra sobre la 'respiración celular', ¿cómo conectarías estas dos unidades?	19
253	¿Qué unidad introduce el contexto geográfico e histórico del Paraguay?	30
254	¿Qué periodo histórico está directamente relacionado con Domenico Zipoli y Pedro Comentale?	30
255	¿En qué unidad se comienzan a tratar las primeras referencias sobre Música Popular Paraguaya?	30
256	¿Cuál de los siguientes NO es mencionado como un género o estilo de la música paraguaya popular?	30
257	¿En qué unidad se estudia el movimiento del Nuevo Cancionero en Paraguay?	30
\.


--
-- Data for Name: Publicacion; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."Publicacion" (id, titulo, contenido, tipo, "catedraId", "autorAlumnoId", "autorDocenteId", created_at, updated_at, "tareaMaestraId", "visibleToStudents", "evaluacionAsignacionId", "evaluacionMaestraId") FROM stdin;
1	Nueva Tarea: Reflexión sobre un Autor Inspirador	\n      <p>Se ha creado una nueva tarea: <strong>Reflexión sobre un Autor Inspirador</strong>.</p>\n      <p><strong>Descripción:</strong> <p>Instrucciones:</p><ol><li>Escribir a Mano:</li></ol><ul><li class="ql-indent-1">Redacten una reflexión sobre el autor que más los ha inspirado. Pueden hablar sobre su obra, su vida, y cómo ha influido en su forma de pensar o en su vida personal.</li></ul><ol><li>Contenido de la Reflexión:</li></ol><ul><li class="ql-indent-1">Introducción:&nbsp;Presenten al autor y expliquen brevemente su relevancia.</li><li class="ql-indent-1">Desarrollo:&nbsp;Comenten sobre las obras que más les han impactado y por qué.</li><li class="ql-indent-1">Conclusión:&nbsp;Reflexionen sobre cómo este autor ha influido en su vida y en su forma de ver el mundo.</li></ul><ol><li>Formato:</li></ol><ul><li class="ql-indent-1">Deben escribir la reflexión a mano, en un cuaderno o en hojas sueltas.</li></ul><ol><li>Entrega:</li></ol><ul><li class="ql-indent-1">Una vez que hayan terminado, tomen una foto clara de su manuscrito.</li><li class="ql-indent-1">Suban la foto aqui.</li></ul><ol><li>Genuinidad:</li></ol><ul><li class="ql-indent-1">Asegúrense de que sus reflexiones sean sinceras y personales. No se trata solo de lo que creen que se espera, sino de lo que realmente sienten sobre el autor.</li></ul><p><br></p>.</p>\n      <p><strong>Fecha de Entrega:</strong> 7 de noviembre de 2025.</p>\n          	TAREA	2	\N	1	2025-11-07 23:11:34.149	2025-11-07 23:11:34.148	5	f	\N	\N
2	Nueva Tarea: Tarea sobre Filosofía Estética	\n      <p>Se ha creado una nueva tarea: <strong>Tarea sobre Filosofía Estética</strong>.</p>\n      <p><strong>Descripción:</strong> <h3>Introducción</h3><ul><li><strong>Presentación del tema</strong>: La filosofía estética se centra en el estudio de la belleza, el arte y la percepción estética. Su relevancia radica en cómo influye en nuestra comprensión del arte y en la experiencia emocional que este provoca en el espectador.</li><li><strong>Objetivo</strong>: Analizar cómo diversas perspectivas filosóficas han moldeado nuestra apreciación de la estética y su impacto en la vida cotidiana.</li></ul><h3>Análisis de Perspectivas Estéticas</h3><ol><li><strong>Teoría de las Ideas</strong>: La belleza se considera una forma de conocimiento que trasciende lo físico. La relación entre el arte y la realidad se concibe como una imitación, lo que lleva a cuestionar la autenticidad y el valor del arte en comparación con la naturaleza.</li><li><strong>Catarsis Emocional</strong>: El arte se presenta como un medio para provocar emociones profundas en el espectador. La experiencia estética se convierte en un viaje emocional que permite la purificación de sentimientos y la conexión con la humanidad compartida.</li><li><strong>Juicio Estético</strong>: Se enfatiza la idea de que la apreciación de la belleza debe ser desinteresada y objetiva. La subjetividad del espectador juega un papel crucial en la formación de juicios estéticos, lo que sugiere que la belleza puede ser percibida de múltiples maneras según el contexto cultural y personal.</li><li><strong>Expresión Vital</strong>: El arte se entiende como una manifestación de la vida y la voluntad humana. Se valora la capacidad del arte para desafiar las normas y expresar la individualidad, lo que lleva a una reflexión sobre el significado y la función del arte en la sociedad.</li><li>Usa el la linea de tiempo que usamos <a href="https://jufrancopy.github.io/intro_filosofia/" rel="noopener noreferrer" target="_blank">https://jufrancopy.github.io/intro_filosofia/</a></li></ol><h3><br></h3><h3>Reflexión Personal</h3><ul><li><strong>Impacto Personal</strong>: Reflexiona sobre cómo estas perspectivas han influido en tu propia percepción de lo estético. Considera cómo han enriquecido tu comprensión del arte y su papel en tu vida.</li><li><strong>Conclusiones</strong>: Resume las lecciones aprendidas sobre la estética y su aplicación en tu día a día, así como en tu práctica artística o apreciación del arte.</li></ul><p><br></p>.</p>\n      <p><strong>Fecha de Entrega:</strong> 7 de noviembre de 2025.</p>\n          	TAREA	1	\N	1	2025-11-08 02:12:10.157	2025-11-08 02:12:10.155	6	f	\N	\N
3	Recordatorio de Vencimiento de Plazo!	<p>El plazo para la entrega de la última tarea ha sido el viernes, 7 de noviembre, por lo que por cada día de demora hasta el examen fechado para el 13 de noviembre, van perdiendo 1 punto. </p>	ANUNCIO	2	\N	1	2025-11-10 00:42:49.638	2025-11-10 00:42:49.636	\N	f	\N	\N
14	Nueva Evaluación: Evaluación de Genera preguntas que coencten las unidades para Historia de la Música del Paraguay	Se ha generado una nueva evaluación: **Evaluación de Genera preguntas que coencten las unidades para Historia de la Música del Paraguay**.\n\n        Puedes encontrarla en la pestaña de evaluaciones para su revisión y asignación.	EVALUACION	2	\N	1	2025-11-13 02:04:52.378	2025-11-13 02:04:52.377	\N	f	\N	19
23	Nueva Evaluación: Evaluación de test para Historia de la Música del Paraguay	Se ha generado una nueva evaluación: **Evaluación de test para Historia de la Música del Paraguay**.\n\n        Puedes encontrarla en la pestaña de evaluaciones para su revisión y asignación.	EVALUACION	2	\N	1	2025-11-13 02:50:08.899	2025-11-13 02:50:08.897	\N	f	\N	28
25	Nueva Evaluación: Evaluación de test para Historia de la Música del Paraguay	Se ha generado una nueva evaluación: **Evaluación de test para Historia de la Música del Paraguay**.\n\n        Puedes encontrarla en la pestaña de evaluaciones para su revisión y asignación.	EVALUACION	2	\N	1	2025-11-13 03:20:02.179	2025-11-13 03:20:02.177	\N	f	\N	30
\.


--
-- Data for Name: PublicacionInteraccion; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."PublicacionInteraccion" (id, "publicacionId", "alumnoId", "docenteId", tipo, created_at) FROM stdin;
1	2	\N	1	ME_GUSTA	2025-11-08 15:00:03.477
2	1	\N	1	ME_GUSTA	2025-11-08 22:41:14.256
\.


--
-- Data for Name: Puntuacion; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."Puntuacion" (id, puntos, motivo, created_at, "alumnoId", "catedraId", tipo) FROM stdin;
1	20	Tarea: Tarea: Prejuicios Estéticos y Análisis Morfológico	2025-11-07 23:07:51.681	3	2	TAREA
2	20	Tarea: Tarea: Prejuicios Estéticos y Análisis Morfológico	2025-11-07 23:07:51.683	4	2	TAREA
3	20	Tarea: Tarea: Prejuicios Estéticos y Análisis Morfológico	2025-11-07 23:07:51.686	5	2	TAREA
4	20	Tarea: Tarea: Prejuicios Estéticos y Análisis Morfológico	2025-11-07 23:07:51.687	6	2	TAREA
5	20	Tarea: Tarea: Prejuicios Estéticos y Análisis Morfológico	2025-11-07 23:07:51.69	7	2	TAREA
6	20	Tarea: Tarea: Prejuicios Estéticos y Análisis Morfológico	2025-11-07 23:07:51.693	8	2	TAREA
7	20	Tarea: Tarea: Prejuicios Estéticos y Análisis Morfológico	2025-11-07 23:07:51.697	9	2	TAREA
8	20	Tarea: Tarea: Prejuicios Estéticos y Análisis Morfológico	2025-11-07 23:07:51.699	10	2	TAREA
9	20	Tarea: Tarea: Prejuicios Estéticos y Análisis Morfológico	2025-11-07 23:07:51.702	2	2	TAREA
10	20	Tarea: Tarea: Prejuicios Estéticos y Análisis Morfológico	2025-11-07 23:07:51.704	1	2	TAREA
11	20	Tarea: Tarea: Prejuicios Estéticos y Análisis Morfológico	2025-11-07 23:07:51.707	16	2	TAREA
12	20	Tarea: Tarea: Prejuicios Estéticos y Análisis Morfológico	2025-11-07 23:07:51.71	17	2	TAREA
13	20	Tarea: Tarea: Instrumentos Musicales Indígenas	2025-11-07 23:07:51.714	3	2	TAREA
14	20	Tarea: Tarea: Instrumentos Musicales Indígenas	2025-11-07 23:07:51.718	4	2	TAREA
15	20	Tarea: Tarea: Instrumentos Musicales Indígenas	2025-11-07 23:07:51.721	5	2	TAREA
16	20	Tarea: Tarea: Instrumentos Musicales Indígenas	2025-11-07 23:07:51.724	6	2	TAREA
17	20	Tarea: Tarea: Instrumentos Musicales Indígenas	2025-11-07 23:07:51.728	7	2	TAREA
18	20	Tarea: Tarea: Instrumentos Musicales Indígenas	2025-11-07 23:07:51.732	8	2	TAREA
19	20	Tarea: Tarea: Instrumentos Musicales Indígenas	2025-11-07 23:07:51.734	9	2	TAREA
20	20	Tarea: Tarea: Instrumentos Musicales Indígenas	2025-11-07 23:07:51.736	10	2	TAREA
21	20	Tarea: Tarea: Instrumentos Musicales Indígenas	2025-11-07 23:07:51.737	2	2	TAREA
22	20	Tarea: Tarea: Instrumentos Musicales Indígenas	2025-11-07 23:07:51.739	1	2	TAREA
23	20	Tarea: Tarea: Instrumentos Musicales Indígenas	2025-11-07 23:07:51.74	16	2	TAREA
24	20	Tarea: Tarea: Instrumentos Musicales Indígenas	2025-11-07 23:07:51.741	17	2	TAREA
25	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE	2025-11-07 23:07:51.743	3	2	EVALUACION
26	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE	2025-11-07 23:07:51.745	4	2	EVALUACION
27	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE	2025-11-07 23:07:51.746	5	2	EVALUACION
28	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE	2025-11-07 23:07:51.747	6	2	EVALUACION
29	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE	2025-11-07 23:07:51.75	7	2	EVALUACION
30	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE	2025-11-07 23:07:51.752	8	2	EVALUACION
31	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE	2025-11-07 23:07:51.754	9	2	EVALUACION
32	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE	2025-11-07 23:07:51.755	10	2	EVALUACION
33	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE	2025-11-07 23:07:51.757	2	2	EVALUACION
34	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE	2025-11-07 23:07:51.759	1	2	EVALUACION
35	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE	2025-11-07 23:07:51.761	16	2	EVALUACION
36	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE	2025-11-07 23:07:51.764	17	2	EVALUACION
37	20	Evaluación: Evaluación sobre el Periodo de Los López	2025-11-07 23:07:51.766	3	2	EVALUACION
38	20	Evaluación: Evaluación sobre el Periodo de Los López	2025-11-07 23:07:51.767	4	2	EVALUACION
39	20	Evaluación: Evaluación sobre el Periodo de Los López	2025-11-07 23:07:51.77	5	2	EVALUACION
40	20	Evaluación: Evaluación sobre el Periodo de Los López	2025-11-07 23:07:51.771	6	2	EVALUACION
41	20	Evaluación: Evaluación sobre el Periodo de Los López	2025-11-07 23:07:51.773	7	2	EVALUACION
42	20	Evaluación: Evaluación sobre el Periodo de Los López	2025-11-07 23:07:51.774	8	2	EVALUACION
43	20	Evaluación: Evaluación sobre el Periodo de Los López	2025-11-07 23:07:51.777	9	2	EVALUACION
44	20	Evaluación: Evaluación sobre el Periodo de Los López	2025-11-07 23:07:51.778	10	2	EVALUACION
45	20	Evaluación: Evaluación sobre el Periodo de Los López	2025-11-07 23:07:51.78	2	2	EVALUACION
46	20	Evaluación: Evaluación sobre el Periodo de Los López	2025-11-07 23:07:51.781	1	2	EVALUACION
47	20	Evaluación: Evaluación sobre el Periodo de Los López	2025-11-07 23:07:51.782	16	2	EVALUACION
48	20	Evaluación: Evaluación sobre el Periodo de Los López	2025-11-07 23:07:51.784	17	2	EVALUACION
49	10	Tarea: Tarea: Contextualización Filosófica de la Estética	2025-11-07 23:07:51.786	11	1	TAREA
50	10	Tarea: Tarea: Contextualización Filosófica de la Estética	2025-11-07 23:07:51.788	12	1	TAREA
51	10	Tarea: Tarea: Contextualización Filosófica de la Estética	2025-11-07 23:07:51.79	13	1	TAREA
52	10	Tarea: Tarea: Contextualización Filosófica de la Estética	2025-11-07 23:07:51.791	14	1	TAREA
53	10	Tarea: Tarea: Contextualización Filosófica de la Estética	2025-11-07 23:07:51.793	15	1	TAREA
54	10	Tarea: Tarea: Análisis de la Filosofía Antigua del Arte	2025-11-07 23:07:51.796	11	1	TAREA
55	10	Tarea: Tarea: Análisis de la Filosofía Antigua del Arte	2025-11-07 23:07:51.798	12	1	TAREA
56	10	Tarea: Tarea: Análisis de la Filosofía Antigua del Arte	2025-11-07 23:07:51.8	13	1	TAREA
57	10	Tarea: Tarea: Análisis de la Filosofía Antigua del Arte	2025-11-07 23:07:51.801	14	1	TAREA
58	10	Tarea: Tarea: Análisis de la Filosofía Antigua del Arte	2025-11-07 23:07:51.803	15	1	TAREA
59	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE Filosofía	2025-11-07 23:07:51.805	11	1	EVALUACION
60	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE Filosofía	2025-11-07 23:07:51.807	12	1	EVALUACION
61	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE Filosofía	2025-11-07 23:07:51.809	13	1	EVALUACION
62	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE Filosofía	2025-11-07 23:07:51.81	14	1	EVALUACION
63	20	Evaluación: EVALUACIÓN 1ER. CUATRIMESTRE Filosofía	2025-11-07 23:07:51.812	15	1	EVALUACION
64	20	Evaluación: Evaluación: El mundo del arte en el pensamiento filosófico	2025-11-07 23:07:51.813	11	1	EVALUACION
65	20	Evaluación: Evaluación: El mundo del arte en el pensamiento filosófico	2025-11-07 23:07:51.815	12	1	EVALUACION
66	20	Evaluación: Evaluación: El mundo del arte en el pensamiento filosófico	2025-11-07 23:07:51.817	13	1	EVALUACION
67	20	Evaluación: Evaluación: El mundo del arte en el pensamiento filosófico	2025-11-07 23:07:51.82	14	1	EVALUACION
68	20	Evaluación: Evaluación: El mundo del arte en el pensamiento filosófico	2025-11-07 23:07:51.823	15	1	EVALUACION
69	20	Evaluación: Evaluación: Nietzsche y la voluntad de poder como arte	2025-11-07 23:07:51.825	11	1	EVALUACION
70	20	Evaluación: Evaluación: Nietzsche y la voluntad de poder como arte	2025-11-07 23:07:51.827	12	1	EVALUACION
71	20	Evaluación: Evaluación: Nietzsche y la voluntad de poder como arte	2025-11-07 23:07:51.83	13	1	EVALUACION
72	20	Evaluación: Evaluación: Nietzsche y la voluntad de poder como arte	2025-11-07 23:07:51.832	14	1	EVALUACION
73	20	Evaluación: Evaluación: Nietzsche y la voluntad de poder como arte	2025-11-07 23:07:51.834	15	1	EVALUACION
\.


--
-- Data for Name: Rating; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."Rating" (id, rating_value, ip_address, created_at, "composerId") FROM stdin;
4	5	::ffff:127.0.0.1	2025-11-08 14:21:50.189	5
5	5	::ffff:127.0.0.1	2025-11-08 14:22:07.31	34
6	5	::ffff:127.0.0.1	2025-11-08 14:30:32.243	46
2	3	::ffff:127.0.0.1	2025-11-08 14:13:45.457	3
1	4	::ffff:127.0.0.1	2025-11-08 13:53:03.183	2
3	3	::ffff:127.0.0.1	2025-11-08 14:14:05.357	1
10	5	::ffff:127.0.0.1	2025-11-08 17:39:57.649	13
\.


--
-- Data for Name: RespuestaAlumno; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."RespuestaAlumno" (id, created_at, "alumnoId", "preguntaId", "opcionElegidaId") FROM stdin;
\.


--
-- Data for Name: TareaAsignacion; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."TareaAsignacion" (id, estado, submission_date, puntos_obtenidos, created_at, updated_at, "alumnoId", "tareaMaestraId", comentario_docente, submission_path) FROM stdin;
1	CALIFICADA	2025-11-07 23:07:51.492	20	2025-11-07 23:07:51.492	2025-11-07 23:07:51.492	3	1	\N	{}
2	CALIFICADA	2025-11-07 23:07:51.496	20	2025-11-07 23:07:51.496	2025-11-07 23:07:51.496	4	1	\N	{}
3	CALIFICADA	2025-11-07 23:07:51.499	20	2025-11-07 23:07:51.499	2025-11-07 23:07:51.499	5	1	\N	{}
4	CALIFICADA	2025-11-07 23:07:51.501	20	2025-11-07 23:07:51.501	2025-11-07 23:07:51.501	6	1	\N	{}
5	CALIFICADA	2025-11-07 23:07:51.504	20	2025-11-07 23:07:51.504	2025-11-07 23:07:51.504	7	1	\N	{}
6	CALIFICADA	2025-11-07 23:07:51.505	20	2025-11-07 23:07:51.505	2025-11-07 23:07:51.505	8	1	\N	{}
7	CALIFICADA	2025-11-07 23:07:51.507	20	2025-11-07 23:07:51.507	2025-11-07 23:07:51.507	9	1	\N	{}
8	CALIFICADA	2025-11-07 23:07:51.509	20	2025-11-07 23:07:51.509	2025-11-07 23:07:51.509	10	1	\N	{}
9	CALIFICADA	2025-11-07 23:07:51.511	20	2025-11-07 23:07:51.511	2025-11-07 23:07:51.511	2	1	\N	{}
10	CALIFICADA	2025-11-07 23:07:51.512	20	2025-11-07 23:07:51.512	2025-11-07 23:07:51.512	1	1	\N	{}
11	CALIFICADA	2025-11-07 23:07:51.513	20	2025-11-07 23:07:51.513	2025-11-07 23:07:51.513	16	1	\N	{}
12	CALIFICADA	2025-11-07 23:07:51.515	20	2025-11-07 23:07:51.515	2025-11-07 23:07:51.515	17	1	\N	{}
13	CALIFICADA	2025-11-07 23:07:51.52	20	2025-11-07 23:07:51.52	2025-11-07 23:07:51.52	3	2	\N	{}
14	CALIFICADA	2025-11-07 23:07:51.522	20	2025-11-07 23:07:51.522	2025-11-07 23:07:51.522	4	2	\N	{}
15	CALIFICADA	2025-11-07 23:07:51.524	20	2025-11-07 23:07:51.524	2025-11-07 23:07:51.524	5	2	\N	{}
16	CALIFICADA	2025-11-07 23:07:51.526	20	2025-11-07 23:07:51.526	2025-11-07 23:07:51.526	6	2	\N	{}
17	CALIFICADA	2025-11-07 23:07:51.528	20	2025-11-07 23:07:51.528	2025-11-07 23:07:51.528	7	2	\N	{}
18	CALIFICADA	2025-11-07 23:07:51.531	20	2025-11-07 23:07:51.531	2025-11-07 23:07:51.531	8	2	\N	{}
19	CALIFICADA	2025-11-07 23:07:51.532	20	2025-11-07 23:07:51.532	2025-11-07 23:07:51.532	9	2	\N	{}
20	CALIFICADA	2025-11-07 23:07:51.534	20	2025-11-07 23:07:51.534	2025-11-07 23:07:51.534	10	2	\N	{}
22	CALIFICADA	2025-11-07 23:07:51.538	20	2025-11-07 23:07:51.538	2025-11-07 23:07:51.538	1	2	\N	{}
23	CALIFICADA	2025-11-07 23:07:51.54	20	2025-11-07 23:07:51.54	2025-11-07 23:07:51.54	16	2	\N	{}
24	CALIFICADA	2025-11-07 23:07:51.541	20	2025-11-07 23:07:51.541	2025-11-07 23:07:51.541	17	2	\N	{}
25	ENTREGADA	2025-11-07 23:07:51.659	10	2025-11-07 23:07:51.659	2025-11-07 23:07:51.659	11	3	\N	{}
26	ENTREGADA	2025-11-07 23:07:51.662	10	2025-11-07 23:07:51.662	2025-11-07 23:07:51.662	12	3	\N	{}
27	ENTREGADA	2025-11-07 23:07:51.663	10	2025-11-07 23:07:51.663	2025-11-07 23:07:51.663	13	3	\N	{}
28	ENTREGADA	2025-11-07 23:07:51.665	10	2025-11-07 23:07:51.665	2025-11-07 23:07:51.665	14	3	\N	{}
29	ENTREGADA	2025-11-07 23:07:51.666	10	2025-11-07 23:07:51.666	2025-11-07 23:07:51.666	15	3	\N	{}
30	ENTREGADA	2025-11-07 23:07:51.67	10	2025-11-07 23:07:51.67	2025-11-07 23:07:51.67	11	4	\N	{}
31	ENTREGADA	2025-11-07 23:07:51.672	10	2025-11-07 23:07:51.672	2025-11-07 23:07:51.672	12	4	\N	{}
32	ENTREGADA	2025-11-07 23:07:51.673	10	2025-11-07 23:07:51.673	2025-11-07 23:07:51.673	13	4	\N	{}
33	ENTREGADA	2025-11-07 23:07:51.676	10	2025-11-07 23:07:51.676	2025-11-07 23:07:51.676	14	4	\N	{}
34	ENTREGADA	2025-11-07 23:07:51.677	10	2025-11-07 23:07:51.677	2025-11-07 23:07:51.677	15	4	\N	{}
35	ASIGNADA	\N	\N	2025-11-07 23:15:01.711	2025-11-07 23:15:01.71	3	5	\N	{}
36	ASIGNADA	\N	\N	2025-11-07 23:15:01.72	2025-11-07 23:15:01.719	4	5	\N	{}
40	ASIGNADA	\N	\N	2025-11-07 23:15:01.761	2025-11-07 23:15:01.76	8	5	\N	{}
41	ASIGNADA	\N	\N	2025-11-07 23:15:01.772	2025-11-07 23:15:01.77	9	5	\N	{}
44	ASIGNADA	\N	\N	2025-11-07 23:15:01.802	2025-11-07 23:15:01.801	1	5	\N	{}
45	ASIGNADA	\N	\N	2025-11-07 23:15:01.81	2025-11-07 23:15:01.808	16	5	\N	{}
21	CALIFICADA	2025-11-07 23:07:51.537	20	2025-11-07 23:07:51.537	2025-11-07 23:07:51.537	2	2	\N	{/uploads/entregas/file-1762434722678-691945803.png}
38	CALIFICADA	\N	16	2025-11-07 23:15:01.735	2025-11-07 23:15:01.734	6	5	\N	{/uploads/entregas/file-1762522038566-382392825.jpg}
42	CALIFICADA	\N	16	2025-11-07 23:15:01.784	2025-11-07 23:15:01.783	10	5	\N	{/uploads/entregas/file-1762521890594-240601827.jpg}
46	CALIFICADA	\N	16	2025-11-07 23:15:01.816	2025-11-07 23:15:01.815	17	5	\N	{/uploads/entregas/file-1762463624784-13398315.jpeg}
43	CALIFICADA	2025-11-08 01:18:24.185	20	2025-11-07 23:15:01.795	2025-11-07 23:15:01.793	2	5	\N	{/uploads/entregas/files-1762564704163-576456425.png,/uploads/entregas/files-1762564704172-951697305.png}
47	ASIGNADA	\N	\N	2025-11-08 02:17:08.39	2025-11-08 02:17:08.389	11	6	\N	{}
48	ASIGNADA	\N	\N	2025-11-08 02:17:08.404	2025-11-08 02:17:08.402	12	6	\N	{}
50	ASIGNADA	\N	\N	2025-11-08 02:17:08.417	2025-11-08 02:17:08.416	14	6	\N	{}
51	ASIGNADA	\N	\N	2025-11-08 02:17:08.424	2025-11-08 02:17:08.423	15	6	\N	{}
52	ASIGNADA	\N	\N	2025-11-08 02:17:08.432	2025-11-08 02:17:08.431	2	6	\N	{}
39	ENTREGADA	2025-11-08 02:35:20.198	\N	2025-11-07 23:15:01.748	2025-11-07 23:15:01.747	7	5	\N	{/uploads/entregas/files-1762569320141-503970513.jpg,/uploads/entregas/files-1762569320174-23951874.jpg}
37	ENTREGADA	2025-11-12 21:36:16.789	\N	2025-11-07 23:15:01.725	2025-11-07 23:15:01.724	5	5	\N	{/uploads/entregas/files-1762983376758-54234917.jpg}
49	ENTREGADA	2025-11-13 02:21:48.453	\N	2025-11-08 02:17:08.411	2025-11-08 02:17:08.41	13	6	\N	{/uploads/entregas/files-1763000508443-902953552.pdf}
\.


--
-- Data for Name: TareaMaestra; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."TareaMaestra" (id, titulo, descripcion, fecha_entrega, puntos_posibles, recursos, multimedia_path, created_at, updated_at, "catedraId", "publicacionId", "unidadPlanId") FROM stdin;
1	Tarea: Prejuicios Estéticos y Análisis Morfológico	Investigar y analizar dos ejemplos de prejuicios estéticos en la música, y aplicar un análisis morfológico básico a una pieza musical indígena (proporcionada en clase).	2025-04-15 23:59:59	20	{"Guía de análisis morfológico.pdf"}	\N	2025-11-07 23:07:51.487	2025-11-07 23:07:51.487	2	\N	1
2	Tarea: Instrumentos Musicales Indígenas	Realizar una investigación sobre 3 instrumentos musicales étnicos del Paraguay. Incluir descripción, origen, y uso en rituales o danzas. Presentar en formato de informe corto con imágenes.	2025-05-10 23:59:59	20	{"Lista de recursos bibliográficos.pdf"}	\N	2025-11-07 23:07:51.517	2025-11-07 23:07:51.517	2	\N	3
3	Tarea: Contextualización Filosófica de la Estética	Realizar un breve ensayo sobre la filosofía como disciplina humanística y su relación con la estética.	2025-03-30 23:59:59	10	{}	\N	2025-11-07 23:07:51.657	2025-11-07 23:07:51.657	1	\N	18
4	Tarea: Análisis de la Filosofía Antigua del Arte	Analizar un mito o tragedia griega y relacionarlo con el pensamiento filosófico de la época sobre el arte.	2025-05-10 23:59:59	10	{}	\N	2025-11-07 23:07:51.668	2025-11-07 23:07:51.668	1	\N	21
5	Reflexión sobre un Autor Inspirador	<p>Instrucciones:</p><ol><li>Escribir a Mano:</li></ol><ul><li class="ql-indent-1">Redacten una reflexión sobre el autor que más los ha inspirado. Pueden hablar sobre su obra, su vida, y cómo ha influido en su forma de pensar o en su vida personal.</li></ul><ol><li>Contenido de la Reflexión:</li></ol><ul><li class="ql-indent-1">Introducción:&nbsp;Presenten al autor y expliquen brevemente su relevancia.</li><li class="ql-indent-1">Desarrollo:&nbsp;Comenten sobre las obras que más les han impactado y por qué.</li><li class="ql-indent-1">Conclusión:&nbsp;Reflexionen sobre cómo este autor ha influido en su vida y en su forma de ver el mundo.</li></ul><ol><li>Formato:</li></ol><ul><li class="ql-indent-1">Deben escribir la reflexión a mano, en un cuaderno o en hojas sueltas.</li></ul><ol><li>Entrega:</li></ol><ul><li class="ql-indent-1">Una vez que hayan terminado, tomen una foto clara de su manuscrito.</li><li class="ql-indent-1">Suban la foto aqui.</li></ul><ol><li>Genuinidad:</li></ol><ul><li class="ql-indent-1">Asegúrense de que sus reflexiones sean sinceras y personales. No se trata solo de lo que creen que se espera, sino de lo que realmente sienten sobre el autor.</li></ul><p><br></p>	2025-11-07 00:00:00	20	{https://hmpy.thepydeveloper.dev/}	\N	2025-11-07 23:11:34.11	2025-11-07 23:11:34.108	2	1	15
6	Tarea sobre Filosofía Estética	<h3>Introducción</h3><ul><li><strong>Presentación del tema</strong>: La filosofía estética se centra en el estudio de la belleza, el arte y la percepción estética. Su relevancia radica en cómo influye en nuestra comprensión del arte y en la experiencia emocional que este provoca en el espectador.</li><li><strong>Objetivo</strong>: Analizar cómo diversas perspectivas filosóficas han moldeado nuestra apreciación de la estética y su impacto en la vida cotidiana.</li></ul><h3>Análisis de Perspectivas Estéticas</h3><ol><li><strong>Teoría de las Ideas</strong>: La belleza se considera una forma de conocimiento que trasciende lo físico. La relación entre el arte y la realidad se concibe como una imitación, lo que lleva a cuestionar la autenticidad y el valor del arte en comparación con la naturaleza.</li><li><strong>Catarsis Emocional</strong>: El arte se presenta como un medio para provocar emociones profundas en el espectador. La experiencia estética se convierte en un viaje emocional que permite la purificación de sentimientos y la conexión con la humanidad compartida.</li><li><strong>Juicio Estético</strong>: Se enfatiza la idea de que la apreciación de la belleza debe ser desinteresada y objetiva. La subjetividad del espectador juega un papel crucial en la formación de juicios estéticos, lo que sugiere que la belleza puede ser percibida de múltiples maneras según el contexto cultural y personal.</li><li><strong>Expresión Vital</strong>: El arte se entiende como una manifestación de la vida y la voluntad humana. Se valora la capacidad del arte para desafiar las normas y expresar la individualidad, lo que lleva a una reflexión sobre el significado y la función del arte en la sociedad.</li><li>Usa el la linea de tiempo que usamos <a href="https://jufrancopy.github.io/intro_filosofia/" rel="noopener noreferrer" target="_blank">https://jufrancopy.github.io/intro_filosofia/</a></li></ol><h3><br></h3><h3>Reflexión Personal</h3><ul><li><strong>Impacto Personal</strong>: Reflexiona sobre cómo estas perspectivas han influido en tu propia percepción de lo estético. Considera cómo han enriquecido tu comprensión del arte y su papel en tu vida.</li><li><strong>Conclusiones</strong>: Resume las lecciones aprendidas sobre la estética y su aplicación en tu día a día, así como en tu práctica artística o apreciación del arte.</li></ul><p><br></p>	2025-11-07 00:00:00	20	{https://jufrancopy.github.io/intro_filosofia/}	\N	2025-11-08 02:12:10.068	2025-11-08 02:12:10.066	1	2	33
\.


--
-- Data for Name: UnidadPlan; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."UnidadPlan" (id, "planDeClasesId", periodo, contenido, capacidades, "horasTeoricas", "horasPracticas", "estrategiasMetodologicas", "mediosVerificacionEvaluacion", created_at, updated_at, recursos) FROM stdin;
1	1	Marzo (2ª Quincena)	UNIDAD 1: INTRODUCCIÓN (El Paraguay, Una provincia gigante, Integración política y cultural).	Comprender el proceso de consolidación, origen y antecedentes históricos de la música paraguaya.	2	0	Clase introductoria (Exposición oral). Presentación del programa.	Tareas y Trabajos prácticos.	2025-11-07 23:07:51.362	2025-11-07 23:07:51.362	{}
2	1	Abril (1ª Quincena)	UNIDAD 2: LOS INDÍGENAS Y SU MÚSICA (El prejuicio de lo estético, Análisis Morfológico).	Conocer y analizar características sociales y culturales de cada familia lingüística de la población indígena.	2	0	Clases magistrales. Uso de medios auxiliares (pizarra, folletos).	Evaluación continua del progreso.	2025-11-07 23:07:51.365	2025-11-07 23:07:51.365	{}
3	1	Abril (2ª Quincena)	UNIDAD 2 (Continuación) (Instrumentos musicales, Descripción más amplia de instrumentos étnicos).	Analizar la música desde la perspectiva del canto, los instrumentos, las danzas y los rituales.	2	0	Análisis de material bibliográfico (Ej: BOETTNER, MELIÁ).	Tareas y Trabajos prácticos sobre instrumentos.	2025-11-07 23:07:51.367	2025-11-07 23:07:51.367	{}
4	1	Mayo (1ª Quincena)	UNIDAD 3: LA MÚSICA DURANTE LA COLONIA. UNIDAD 4: LAS MISIONES JESUÍTICAS (Los jesuitas y la música).	Conocer las características culturales de la etapa de colonización. Analizar la labor de los misioneros y las características de la música reduccional.	2	0	Explicación detallada de los temas a trabajar (Exposición oral).	Evaluación de la comprensión y aplicación de conceptos.	2025-11-07 23:07:51.369	2025-11-07 23:07:51.369	{}
5	1	Mayo (2ª Quincena)	UNIDAD 4 (Continuación) (Músicos jesuitas destacados: Pedro Comentale, Domenico Zipoli, etc.).	Conocer biografía y obras de músicos paraguayos de cada etapa.	2	0	Clases magistrales enfocadas en personajes históricos.	Seguimiento del progreso en el estudio.	2025-11-07 23:07:51.371	2025-11-07 23:07:51.371	{}
6	1	Junio (1ª Quincena)	UNIDAD 5: LA INDEPENDENCIA (Música y la dictadura de Francia, El auténtico himno paraguayo, Músicos destacados).	Conocer las manifestaciones culturales de este periodo (1811-1840).	2	0	Enfoque en el estudio temático seleccionado.	Evaluación del progreso y dominio de los conceptos.	2025-11-07 23:07:51.373	2025-11-07 23:07:51.373	{}
7	1	Junio (2ª Quincena)	EVALUACIÓN 1ER. CUATRIMESTRE (Unidades 1 a 5).	Demostrar dominio y comprensión de los contenidos del primer cuatrimestre.	0	0	Prueba escrita cuatrimestral.	Prueba escrita cuatrimestral (Suma Tareas/Trabajos Prácticos).	2025-11-07 23:07:51.375	2025-11-07 23:07:51.375	{}
8	1	Julio (1ª Quincena)	UNIDAD 6: LOS LÓPEZ (Progreso material y cultural, Primeras referencias sobre Música Popular Paraguaya).	Analizar los procesos a través de las etapas históricas (Los López).	2	0	Se facilitarán materiales bibliográficos para el desarrollo de las lecciones.	Tareas y Trabajos prácticos.	2025-11-07 23:07:51.377	2025-11-07 23:07:51.377	{}
9	1	Julio (2ª Quincena)	UNIDAD 7: HIMNO NACIONAL PARAGUAYO. UNIDAD 8: LA GUERRA DE LA TRIPLE ALIANZA.	Conocer la historia del Himno y analizar el impacto cultural de la guerra.	2	0	Uso de textos específicos (Ej: CALZADA MACHO).	Seguimiento del progreso y aplicación de conceptos.	2025-11-07 23:07:51.381	2025-11-07 23:07:51.381	{}
10	1	Agosto (1ª Quincena)	UNIDAD 9: DANZAS PARAGUAYAS (Origen, Tipos, Trajes típicos).	Conocer rasgos culturales propios del paraguayo y las manifestaciones de su identidad.	2	0	Repaso y ampliación de las unidades trabajadas (Exposición oral).	Evaluación de la mejora en la comprensión y aplicación.	2025-11-07 23:07:51.385	2025-11-07 23:07:51.385	{}
11	1	Agosto (2ª Quincena)	UNIDAD 10: EL COMPUESTO. UNIDAD 11: EL JEJUVYKUE JERÁ.	Analizar estos géneros como expresiones musicales de los habitantes de esta tierra.	2	0	Práctica de técnicas de análisis.	Evaluación de dominio y precisión.	2025-11-07 23:07:51.388	2025-11-07 23:07:51.388	{}
12	1	Setiembre (1ª Quincena)	UNIDAD 12: LOS ESTACIONEROS O PASIONEROS. UNIDAD 13: MÚSICA PARAGUAYA (Popular, Géneros y Estilos: Polca, Guarania, Purahéi, Kyre’ŷ, etc.).	Analizar la función de las agrupaciones tradicionales. Analizar la música erudita y popular (Géneros y Estilos).	2	0	Estudio y perfeccionamiento temático.	Evaluación del avance y dominio de los géneros.	2025-11-07 23:07:51.392	2025-11-07 23:07:51.392	{}
13	1	Octubre (1ª Quincena)	UNIDAD 14: AGRUPACIONES TRADICIONALES (Cantores, Bandas Hyekue, Orquestas Típicas). UNIDAD 15: ZARZUELA PARAGUAYA (Generalidades).	Conocer la conformación de grupos tradicionales y reconocer al creador de la zarzuela (J.C. Moreno González).	2	0	Preparación para la evaluación.	Evaluación del dominio de las unidades.	2025-11-07 23:07:51.396	2025-11-07 23:07:51.396	{}
14	1	Octubre (2ª Quincena)	EVALUACIÓN 2DO. CUATRIMESTRE (Unidades 6 a 15).	Demostrar dominio y comprensión de los contenidos del segundo cuatrimestre.	0	0	Prueba escrita cuatrimestral.	Prueba escrita cuatrimestral (Requisito: 80% asistencia y tareas).	2025-11-07 23:07:51.399	2025-11-07 23:07:51.399	{}
15	1	Noviembre (hasta el 9)	UNIDAD 16: COMPOSITORES PARAGUAYOS DEL SIGLO XX (Mangoré, Flores, Giménez, etc.).	Analizar la música erudita y popular de compositores destacados.	2	0	Consolidación y perfeccionamiento de los temas. Exploración de bibliografía (SZARÁN, SÁNCHEZ HAASE).	Evaluación de la comprensión y aplicación de características estilísticas.	2025-11-07 23:07:51.402	2025-11-07 23:07:51.402	{}
16	1	Noviembre (10 al 14)	SEMANA DE EVALUACIÓN DE MATERIAS TEÓRICAS	Obtener un Término Medio Mínimo o superior a la calificación 2 resultante de los dos cuatrimestres para habilitar el examen final.	0	0	EVALUACIÓN FINAL (Según el cronograma institucional).	Evaluación Final (Requisito previo: T.M. habilitante y 11 clases de asistencia mínima por cuatrimestre).	2025-11-07 23:07:51.405	2025-11-07 23:07:51.405	{}
17	1	Noviembre (17 al 28)	UNIDAD 17: EL MOVIMIENTO DEL NUEVO CANCIONERO EN PARAGUAY. Cierre y Retroalimentación.	Reflexionar y emitir juicios de valor sobre la historia de la música paraguaya a lo largo del tiempo y en la actualidad.	4	0	Preparación para una presentación final/Trabajo de reflexión.	Certificación de Desempeño (El estudiante debe tener un 70% de las tareas y trabajos prácticos exigidos).	2025-11-07 23:07:51.409	2025-11-07 23:07:51.409	{}
18	2	Marzo (2ª Quincena)	UNIDAD I: CONTEXTUALIZACIÓN FILOSÓFICA DE LA ESTÉTICA (La filosofía como disciplina humanística).	Ubicar al estudiante en los ciclos intelectuales de sistemas filosóficos, propiciando la diversidad y pluralidad.	2	0	Exposición oral y Participación. Introducción a la bibliografía básica.	Registro anecdótico y Observación. Tareas de contextualización.	2025-11-07 23:07:51.546	2025-11-07 23:07:51.546	{}
19	2	Abril (1ª Q)	UNIDAD I (Continuación): El mundo del arte en el pensamiento filosófico.	Interpretar temas y problemas de la filosofía frente a las diversas disciplinas.	2	0	Clases expositivas-participativas. Apoyo con audición de obras varias.	Mapas conceptuales y/o Trabajos prácticos.	2025-11-07 23:07:51.547	2025-11-07 23:07:51.547	{}
20	2	Abril (2ª Q)	UNIDAD I (Cierre): La estética, crítica y teoría del arte.	Desarrollar lineamientos relevantes sobre la corriente estética de la filosofía.	2	0	Análisis de textos introductorios (Jiménez, Oliveras).	Evaluación continua de la comprensión.	2025-11-07 23:07:51.549	2025-11-07 23:07:51.549	{}
21	2	Mayo (1ª Q)	UNIDAD II: LA FILOSOFÍA ANTIGUA DEL ARTE (Mitos, Tragedias y el legado de la antigua Grecia).	Analizar los principales pensamientos filosóficos en el ámbito de la estética.	2	0	Exposición magistral. Análisis de fragmentos de Poética (Aristóteles).	Prueba oral o escrita corta.	2025-11-07 23:07:51.55	2025-11-07 23:07:51.55	{}
22	2	Mayo (2ª Q)	UNIDAD II (Continuación): Platón y el canon de belleza suprema; Aristóteles, el arte como vivencia e imitación.	Aplicar críticamente los pensamientos en el mundo del arte.	2	0	Lectura y discusión de El Banquete, Fedro (Platón).	Trabajos de investigación bibliográfica individual.	2025-11-07 23:07:51.552	2025-11-07 23:07:51.552	{}
23	2	Junio (1ª Q)	UNIDAD III: LA FILOSOFÍA DEL ARTE EN LA EDAD MODERNA (Kant, entre lo bello y lo sublime).	Indagar y contraponer los diversos criterios en la formulación de propios argumentos.	2	0	Exposición enfocada en Crítica del Juicio (Kant).	Escala de actitudes (participación).	2025-11-07 23:07:51.554	2025-11-07 23:07:51.554	{}
24	2	Junio (2ª Q)	EVALUACIÓN 1ER. CUATRIMESTRE (U. I, II, III inicio).	Demostrar comprensión de los sistemas filosóficos y estéticos iniciales.	0	0	Examen Cuatrimestral (Prueba escrita).	Examen Cuatrimestral (Suma tareas/trabajos).	2025-11-07 23:07:51.555	2025-11-07 23:07:51.555	{}
25	2	Julio (1ª Q)	UNIDAD III (Continuación): Hegel y el fin del arte; El idealismo alemán en la estética romántica.	Abordar aspectos relacionado al arte con argumentación filosófica.	2	0	Análisis de Introducción a la Estética (Hegel).	Portafolio de trabajos (recopilación de lecturas).	2025-11-07 23:07:51.556	2025-11-07 23:07:51.556	{}
26	2	Julio (2ª Q)	UNIDAD III (Cierre): Nietzsche y la voluntad de poder como arte.	Valorar la condición humana estética ante los cambios en el mundo de la técnica.	2	0	Discusión sobre El nacimiento de la tragedia (Nietzsche).	Tareas de análisis y reflexión.	2025-11-07 23:07:51.558	2025-11-07 23:07:51.558	{}
27	2	Agosto (1ª Q)	UNIDAD IV: PENSAMIENTO DEL SIGLO XX SOBRE EL ARTE (Heidegger, verdad y arte; Benjamín y el aura del arte).	Reflexionar sobre el impacto de la reproductibilidad técnica en la estética.	2	0	Clases expositivas. Apoyo con medios visuales (películas/videos). Análisis de La obra de arte... (Benjamín).	Trabajos de investigación bibliográfica (individual y/o grupal).	2025-11-07 23:07:51.559	2025-11-07 23:07:51.559	{}
28	2	Agosto (2ª Q)	UNIDAD IV (Continuación): Merleau-Ponty y la experiencia estética.	Interpretar la experiencia estética a través de la fenomenología.	2	0	Presentaciones de los alumnos sobre temas específicos.	Pruebas prácticas sobre aplicación de conceptos.	2025-11-07 23:07:51.56	2025-11-07 23:07:51.56	{}
29	2	Setiembre (1ª Q)	UNIDAD V: CONTEMPORANEIDAD EN LA ESTÉTICA FILOSÓFICA (Jameson y la playa estética).	Analizar el pensamiento posmoderno en relación al arte.	2	0	Discusión sobre Posmodernismo o la lógica cultural... (Jameson).	Evaluación continua basada en la participación en debates.	2025-11-07 23:07:51.562	2025-11-07 23:07:51.562	{}
30	2	Setiembre (2ª Q)	UNIDAD V (Continuación): Chul Han y la salvación de lo bello; Vattimo, en el crepúsculo del arte.	Analizar las corrientes estéticas actuales.	2	0	Exposición sobre La salvación de lo bello (Chul-Han) y El fin de la modernidad (Vattimo).	Elaboración de un argumento filosófico propio.	2025-11-07 23:07:51.563	2025-11-07 23:07:51.563	{}
31	2	Octubre (1ª Q)	UNIDAD V (Cierre): Gadamer como justificación del arte. Repaso e Integración.	Integrar críticamente los diversos criterios en la formulación de argumentos propios.	2	0	Clases de repaso y resolución de dudas.	Preparación para el examen cuatrimestral.	2025-11-07 23:07:51.564	2025-11-07 23:07:51.564	{}
32	2	Octubre (2ª Q)	EVALUACIÓN 2DO. CUATRIMESTRE (U. III cierre, IV, V).	Demostrar dominio de las corrientes estéticas modernas y contemporáneas.	0	0	Examen Cuatrimestral (Prueba escrita).	Examen Cuatrimestral. El conservatorio establece que la participación en conciertos vale puntaje adicional.	2025-11-07 23:07:51.566	2025-11-07 23:07:51.566	{}
33	2	Noviembre (hasta el 9)	CONSOLIDACIÓN Y PREPARACIÓN FINAL (Integración de los 5 ejes).	Habilitarse para la evaluación final obteniendo el término medio mínimo.	2	0	Preparación de la defensa de trabajos finales o proyectos de investigación.	Revisión de Portafolio.	2025-11-07 23:07:51.567	2025-11-07 23:07:51.567	{}
34	2	Noviembre (10 al 14)	SEMANA DE EVALUACIÓN DE MATERIAS TEÓRICAS	N/A	0	0	N/A	EVALUACIÓN FINAL (Según cronograma).	2025-11-07 23:07:51.568	2025-11-07 23:07:51.568	{}
35	2	Noviembre (17 al 28)	UNIDAD 17: EL MOVIMIENTO DEL NUEVO CANCIONERO EN PARAGUAY. Cierre y Retroalimentación.	Reflexionar y emitir juicios de valor sobre la historia de la música paraguaya a lo largo del tiempo y en la actualidad.	4	0	Preparación para una presentación final/Trabajo de reflexión.	Certificación de Desempeño (El estudiante debe tener un 70% de las tareas y trabajos prácticos exigidos).	2025-11-07 23:07:51.57	2025-11-07 23:07:51.57	{}
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
ba658f0a-a7ce-4951-82b4-6c45ae76149e	c0a7662db4d46702e27eb540e4d2b21e9499eb7fe2f39a95c590bfe82b997b74	2025-11-08 00:07:22.71665+01	0000_initial_from_existing_db	\N	\N	2025-11-08 00:07:22.711097+01	1
591f4364-e032-43d8-a07e-8edeb4458a6f	a5fa4f5d5822e3665137eaaa40284424add45fdc261ff708e059e4557d499632	2025-11-08 00:07:22.947985+01	0001_initial_schema	\N	\N	2025-11-08 00:07:22.717919+01	1
b2912fbb-9764-4bd9-8d55-c14d1ee5c7e6	b1b7e27b23827cb1d5de863ded4d29987e766b479ab418bd029dc2f75ad85f1c	2025-11-08 00:07:33.244952+01	20251107230733_add_submission_path_as_array	\N	\N	2025-11-08 00:07:33.238184+01	1
\.


--
-- Name: Alumno_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."Alumno_id_seq"', 17, true);


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

SELECT pg_catalog.setval('public."ComentarioPublicacion_id_seq"', 3, true);


--
-- Name: Comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."Comment_id_seq"', 1, true);


--
-- Name: Composer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."Composer_id_seq"', 54, true);


--
-- Name: CostoCatedra_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."CostoCatedra_id_seq"', 1, false);


--
-- Name: DiaClase_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."DiaClase_id_seq"', 9, true);


--
-- Name: Docente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."Docente_id_seq"', 1, true);


--
-- Name: EditSuggestion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."EditSuggestion_id_seq"', 2, true);


--
-- Name: EvaluacionAsignacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."EvaluacionAsignacion_id_seq"', 34, true);


--
-- Name: Evaluacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."Evaluacion_id_seq"', 30, true);


--
-- Name: Opcion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."Opcion_id_seq"', 1003, true);


--
-- Name: Otp_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."Otp_id_seq"', 22, true);


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

SELECT pg_catalog.setval('public."Pregunta_id_seq"', 257, true);


--
-- Name: PublicacionInteraccion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."PublicacionInteraccion_id_seq"', 2, true);


--
-- Name: Publicacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."Publicacion_id_seq"', 25, true);


--
-- Name: Puntuacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."Puntuacion_id_seq"', 73, true);


--
-- Name: Rating_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."Rating_id_seq"', 10, true);


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
-- Name: Asistencia Asistencia_alumnoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Asistencia"
    ADD CONSTRAINT "Asistencia_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES public."Alumno"(id);


--
-- Name: Asistencia Asistencia_diaClaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Asistencia"
    ADD CONSTRAINT "Asistencia_diaClaseId_fkey" FOREIGN KEY ("diaClaseId") REFERENCES public."DiaClase"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CalificacionEvaluacion CalificacionEvaluacion_alumnoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."CalificacionEvaluacion"
    ADD CONSTRAINT "CalificacionEvaluacion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES public."Alumno"(id);


--
-- Name: CalificacionEvaluacion CalificacionEvaluacion_evaluacionAsignacionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."CalificacionEvaluacion"
    ADD CONSTRAINT "CalificacionEvaluacion_evaluacionAsignacionId_fkey" FOREIGN KEY ("evaluacionAsignacionId") REFERENCES public."EvaluacionAsignacion"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CatedraAlumno CatedraAlumno_alumnoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."CatedraAlumno"
    ADD CONSTRAINT "CatedraAlumno_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES public."Alumno"(id);


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
-- Name: ComentarioPublicacion ComentarioPublicacion_autorAlumnoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."ComentarioPublicacion"
    ADD CONSTRAINT "ComentarioPublicacion_autorAlumnoId_fkey" FOREIGN KEY ("autorAlumnoId") REFERENCES public."Alumno"(id);


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
-- Name: EvaluacionAsignacion EvaluacionAsignacion_alumnoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."EvaluacionAsignacion"
    ADD CONSTRAINT "EvaluacionAsignacion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES public."Alumno"(id);


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
-- Name: PublicacionInteraccion PublicacionInteraccion_alumnoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."PublicacionInteraccion"
    ADD CONSTRAINT "PublicacionInteraccion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES public."Alumno"(id);


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
-- Name: Publicacion Publicacion_autorAlumnoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Publicacion"
    ADD CONSTRAINT "Publicacion_autorAlumnoId_fkey" FOREIGN KEY ("autorAlumnoId") REFERENCES public."Alumno"(id);


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
-- Name: Puntuacion Puntuacion_alumnoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Puntuacion"
    ADD CONSTRAINT "Puntuacion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES public."Alumno"(id);


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
-- Name: RespuestaAlumno RespuestaAlumno_alumnoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."RespuestaAlumno"
    ADD CONSTRAINT "RespuestaAlumno_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES public."Alumno"(id);


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
-- Name: TareaAsignacion TareaAsignacion_alumnoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."TareaAsignacion"
    ADD CONSTRAINT "TareaAsignacion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES public."Alumno"(id);


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

