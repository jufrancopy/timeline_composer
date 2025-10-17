--
-- PostgreSQL database dump
--

--
-- Drop existing table and sequence if they exist to prevent conflicts
--
DROP TABLE IF EXISTS public."Alumno" CASCADE;
DROP SEQUENCE IF EXISTS public."Alumno_id_seq" CASCADE;

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
-- Name: Alumno id; Type: DEFAULT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Alumno" ALTER COLUMN id SET DEFAULT nextval('public."Alumno_id_seq"'::regclass);


--
-- Data for Name: Alumno; Type: TABLE DATA; Schema: public; Owner: composer_user
--

COPY public."Alumno" (id, nombre, apellido, email, telefono, direccion, instrumento, detalles_adicionales, created_at, updated_at, nombre_tutor, telefono_tutor, vive_con_padres) FROM stdin;
3	Adam Joshua	Park	adamjoshuapark@gmail.com	0972408400	Coronel Irrazabal c/ Azara	Violoncello	Alumno no sabe sus otras materias	2025-10-02 20:02:13.67	2025-10-02 20:02:13.67	JIna Park	0971170515	f
4	Luna Abigail	Benitez Cañete	lunabeni46@gmail.com	0992669184	Yegros y Samudio Corrales	Violin 	Audiopercetpiva, Orquesta, Instrumento	2025-10-02 20:05:28.459	2025-10-02 20:05:28.459	Karina Marisbel Cañete	0992669184	f
5	Santiago Josué	Cruz Valdez	santiagojosuevaldezcruz2011@gmail.com	0976120549	Isla Aranda - Limpio	Piano Clásico	Teoría I, Instrumento, Ensamble	2025-10-02 20:08:14.321	2025-10-02 20:08:14.321	Carolina Arce 	09814293925	f
6	Ricardo Antonio 	Frutos Sánchez	ricardofrutos86@gmail.com	0981215311	7ma Pyda 825 c/ Ayolas	Guitarra Eléctrica	Teoría I, Informática, Instrumento, Ensamble de Jazz	2025-10-02 20:09:53.021	2025-10-02 20:09:53.021	\N	\N	f
7	Fabrizio Maxiliano 	Ruíz Ortega	fabroj777@gmail.com	0991995951	Tte Rojas Silva y 21 Proyectadas	Guitarra Eléctrica	Teoría I, Informática, Ensamble de Jazz, Instrumento	2025-10-02 20:14:06.766	2025-10-02 20:14:06.766	\N	\N	f
8	Kathia Verenize	González Amarilla	kathiayiya@gmaoil.com	0984200962	Urundey c/ Concepción - Barrio Hipódromo 	Piano Clásico	Teoría I, Instrumento, Ensamble	2025-10-02 20:16:49.709	2025-10-02 20:16:49.709	\N	\N	f
9	Iván Lorenzo	Domaniczky	ivandomaniczky@hotmail.com	0994281941	Mcal Estigarribia c/ Mayor Fleitas	Piano Clásico	Tteoria I, Instrumento, Coro Polifónico	2025-10-02 20:19:10.919	2025-10-02 20:19:10.919	\N	\N	f
10	Angel Gabriel 	Rodríguez Galeano	anglrodga@gmai.com	0981854219	Estados Unidos, 16 e/ 17 Pyda	Guitarra Clásica	Instrumento, Teoría I, Coro Polifónico	2025-10-02 20:22:07.626	2025-10-02 20:22:07.626	\N	\N	f
2	Julio	Franco	jucfra23@gmail.com	0981574711	Laurelty 4565, Luque - Paraguay	Cello	Usuario de prueba (docente y alumno).	2025-10-02 15:01:19.677	2025-10-04 00:12:12.585	\N	\N	f
1	Alumno	Prueba	filoartepy@gmail.com	111222333	Calle Falsa 123, Ciudad de Prueba	Piano	Alumno utilizado para pruebas.	2025-10-02 15:01:19.64	2025-10-04 00:12:47.321	\N	\N	t
\.


--
-- Name: Alumno_id_seq; Type: SEQUENCE SET; Schema: public; Owner: composer_user
--

SELECT pg_catalog.setval('public."Alumno_id_seq"', 10, true);


--
-- Name: Alumno Alumno_pkey; Type: CONSTRAINT; Schema: public; Owner: composer_user
--

ALTER TABLE ONLY public."Alumno"
    ADD CONSTRAINT "Alumno_pkey" PRIMARY KEY (id);


--
-- Name: Alumno_email_key; Type: INDEX; Schema: public; Owner: composer_user
--

CREATE UNIQUE INDEX "Alumno_email_key" ON public."Alumno" USING btree (email);


--
-- PostgreSQL database dump complete
--
