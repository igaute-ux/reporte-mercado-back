--
-- PostgreSQL database dump
--

\restrict thPs0V8yALhxF62gmFvecrgrRkq27QEHVlBU7RkWxA1OstML8hMQHo1JGNSrE2X

-- Dumped from database version 16.2 (Debian 16.2-1.pgdg120+2)
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: failed_report; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.failed_report (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "rawMessage" text NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.failed_report OWNER TO admin;

--
-- Name: market_reports; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.market_reports (
    id integer NOT NULL,
    date character varying,
    market character varying,
    origin character varying,
    item character varying,
    exporter character varying,
    variety character varying,
    packaging character varying,
    size character varying,
    price double precision,
    movement character varying,
    weight character varying
);


ALTER TABLE public.market_reports OWNER TO admin;

--
-- Name: market_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.market_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.market_reports_id_seq OWNER TO admin;

--
-- Name: market_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.market_reports_id_seq OWNED BY public.market_reports.id;


--
-- Name: market_reports id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.market_reports ALTER COLUMN id SET DEFAULT nextval('public.market_reports_id_seq'::regclass);


--
-- Data for Name: failed_report; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.failed_report (id, "rawMessage", "createdAt") FROM stdin;
713c8ff9-8aa7-4a23-a6a4-1dde490a3a06	2025-1-27, 广恒/1C/XSUR/SWEET HEART/2*2.5KG/2JD190/®INA/2*2.5KG/JD170/2JD220/清	2025-10-18 17:26:11.795705
eacfa32e-eac6-4832-92d2-6c371234ea52	2025-1-27, 均礼/1C/APFRUT/SKEENA/5KG/XLD90/JD80/2JD100/3JD130 清	2025-10-18 17:26:11.810494
65507687-c38a-44fc-aa01-f468c249c216	2025-1-27, REGINA/2.5KG/2JD/110/2JDD/110/3JD150/ 清	2025-10-18 17:26:11.868151
bdea7831-7b1a-4b53-821b-6ee99922cd14	2025-1-27, REGINA/2.5KG/JD/80-85/2JD/100-105/清	2025-10-18 17:26:11.886807
faa3721c-3122-4277-bd88-1405bbf80853	2025-1-27, SWEET HEART/2*2.5KG/JD140/2JD180/3JD250/4JD300/剩6板	2025-10-18 17:26:11.914471
0fab27e0-6b7c-40b7-b98a-4e4fd103c7df	2025-1-27, 沃农/1C/FRUTBER/REGINA/2.5KG/2JD/代卖走半柜	2025-10-18 17:26:11.932147
a0a7a8e8-70f1-4fc0-9bfd-1acda70dd4db	2025-1-27, 鹏升/1C/ALSU/BING/5KG/XLD	2025-10-18 17:26:11.969048
6850da2e-2ca2-403e-a4eb-4931847558df	2025-1-27, LAPINS/2×2KG/4JD250-260	2025-10-18 17:26:11.97859
38759111-2a66-4270-9af7-182004383a29	2025-1-27, BING/2×2KG/2JD180/3JD210-220	2025-10-18 17:26:11.984876
1d9c53e2-b8b3-4341-a154-30ed7e97ce2d	2025-1-27, SKNNEA/2.5KG/2JD/3JD	2025-10-18 17:26:12.001326
82e9abb0-d4b4-41ec-9ce4-cce3fb8d05f1	2025-1-27, SWEET HEART/2.5KG/2J/混板，代卖清	2025-10-18 17:26:12.011129
c7a7a217-8fff-4aa7-bb00-f1817a669df4	2025-1-27, 世弘/1C/FRUTBER/REGINA/2.5KG/2JD/代卖清	2025-10-18 17:26:12.046712
854bdff1-28c1-4dd0-bc42-79ee5bf92e86	2025-1-27, 世弘/ATLAZ/LAPINS/5KG/XLD80	2025-10-18 17:26:12.063579
3c1c9f63-64e7-4c4a-807e-9f829c93d9e1	2025-1-27, ®INA/5KG/LD/XLD100/部分代卖，清	2025-10-18 17:26:12.094841
296a8e10-6b7a-4136-abe6-eefa96a01ca5	2025-1-27, LAPINS/5KG/XLD/清，部分代卖	2025-10-18 17:26:12.158293
cd227388-8d22-471e-96f0-41ca91be2b2b	2025-1-27, LAPINS/5KG/2J/3J/	2025-10-18 17:26:12.196202
49fb0db5-4562-4434-ac7e-60ef40235b27	2025-1-27, BING/5KG/3J/代卖半柜	2025-10-18 17:26:12.206545
d3b89e86-0203-498e-bf87-80c87c78861b	2025-1-27, 煜谦/1C/ALM/REGINA/5KG/XLD/	2025-10-18 17:26:12.213336
4db08264-4afa-425d-af7f-f376610dd5d4	2025-1-27, LAPINS/5KG/4JD340/大部分代卖，清	2025-10-18 17:26:12.224569
e81756ce-1c26-4aad-bdf9-961d1a5253f1	2025-1-27, 煜谦/1C/SAN FRANCISCO/KORDIA/2*2.5KG/JD/REGINA/2*2.5KG/J/JD/2J/清，基本代卖	2025-10-18 17:26:12.22945
06c01056-f885-409b-adf3-4ae4b1986613	2025-1-27, SWEET.HEART/2*2.5KG/JD/2JD/180，3JD/，清，基本代卖	2025-10-18 17:26:12.25011
2ae3caf8-0c12-4959-a290-91a46fc36de1	2025-1-27, 煜谦/1C/EL PARAUE/REGINA/5KG/XL/QXLD/JD/	2025-10-18 17:26:12.265596
851bbf39-ad23-49ff-b074-e7cc7460e46a	2025-1-27, 2.5KG/2JD/	2025-10-18 17:26:12.274481
1020a562-b9d6-47d5-abd5-cff02b3e1927	2025-1-27, KORDIA/2*2.5KG/2J/代卖清	2025-10-18 17:26:12.278857
adebc6be-6132-463b-88d3-65ea024f243e	2025-1-27, LAPINS/2.5KG/3JD/120，清，部分代卖	2025-10-18 17:26:12.298744
faab5a12-9088-472f-be69-414663550cc8	2025-1-27, KORDIA/2.5KG/2JD/	2025-10-18 17:26:12.321315
55b44083-f4ad-409f-b0e5-d4a585cd7324	2025-1-27, SKEENA/2.5KG/3J/4J/基本代卖	2025-10-18 17:26:12.32753
f9092bd1-4d13-40c7-bafc-e5b5f4c0dde1	2025-1-27, 同合-符号/1C/FRUTTITACO/REGINA/5KG/XL80/XLD90	2025-10-18 17:26:12.343885
235b708f-01d8-4528-ae24-cf7c4332aacf	2025-1-27, SWEET HEART/5KG/XLD/J105/JD	2025-10-18 17:26:12.354216
e09e719d-640e-4fae-bc79-723ae6951481	2025-1-27, LAPINS/5KG/XLD/J105 走6P	2025-10-18 17:26:12.36126
8c2f8afe-6c07-4fe3-b33c-6005769e2324	2025-1-27, 金果-均礼/1C/DOLE/SKEENA/2.5KG/2JD/3JD	2025-10-18 17:26:12.391717
0d890339-f701-48fb-9644-616f7223f8d1	2025-1-27, DOLE GOLD/REGINA/6*2KG/3JD780/部分代卖，清	2025-10-18 17:26:12.398313
805caf0e-42a1-459e-9d2d-78c38b0481f7	2025-1-27, 金果/1C/FRUTBER/REGINA/2.5KG/2JD/没动	2025-10-18 17:26:12.427279
746228d0-ce6b-4357-8d6e-aa0bea82f36a	2025-1-27, 恒果/1C/MEYER/LAPINS/2*2.5KG/JD/2JD/3JD/4J/®INA/2*2.5KG/J/	2025-10-18 17:26:12.466054
734a482a-5eb6-4303-8d9b-946bf5c96574	2025-1-27, 6*2KG/XLD/代卖	2025-10-18 17:26:12.479143
\.


--
-- Data for Name: market_reports; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.market_reports (id, date, market, origin, item, exporter, variety, packaging, size, price, movement, weight) FROM stdin;
8791	2025-1-27	SH	Chile	Cherry	GOLDENGRAGON	REGINA	3*2	2JD	290	Quedaron 8 pallets	KG
8792	2025-1-27	SH	Chile	Cherry	DDC	KORDIA	2*2.5	JD	200	Liquidado	KG
8793	2025-1-27	SH	Chile	Cherry	DDC	KORDIA	2*2.5	2JD	270	Liquidado	KG
8794	2025-1-27	SH	Chile	Cherry	DDC	KORDIA	2*2.5	3J	300	Liquidado	KG
8795	2025-1-27	SH	Chile	Cherry	DDC	KORDIA	2*2.5	3JD	330	Liquidado	KG
8796	2025-1-27	SH	Chile	Cherry	QUELEN	LAPINS	2.5	2JD	NaN	Liquidado	KG
8797	2025-1-27	SH	Chile	Cherry	QUELEN	LAPINS	2.5	3JD	120	Liquidado	KG
8798	2025-1-27	SH	Chile	Cherry	YOLO	LAPINS	2.5	JD	75	Salieron 16 pallets	KG
8799	2025-1-27	SH	Chile	Cherry	YOLO	LAPINS	2.5	2JD	95	Salieron 16 pallets	KG
8800	2025-1-27	SH	Chile	Cherry	YOLO	LAPINS	2.5	3JD	125	Salieron 16 pallets	KG
8801	2025-1-27	SH	Chile	Cherry	HAPPYDRAGON	LAPINS	2.5	JD	NaN	Salieron 15 pallets	KG
8802	2025-1-27	SH	Chile	Cherry	HAPPYDRAGON	LAPINS	2.5	2JD	NaN	Salieron 15 pallets	KG
8803	2025-1-27	SH	Chile	Cherry	HAPPYDRAGON	LAPINS	2.5	3JD	NaN	Salieron 15 pallets	KG
8804	2025-1-27	SH	Chile	Cherry	QUELEN	REGINA	2.5	JD	85	Liquidado	KG
8805	2025-1-27	SH	Chile	Cherry	DOLPHIN	LAPINS	2.5	3JD	120	No especificado	KG
8806	2025-1-27	SH	Chile	Cherry	DOLPHIN	LAPINS	2.5	4JD	160	No especificado	KG
8807	2025-1-27	SH	Chile	Cherry	ZURGROUP	LAPINS	2.5	2J	2	No especificado	KG
8808	2025-1-27	SH	Chile	Cherry	ZURGROUP	LAPINS	2.5	JD	903	No especificado	KG
8809	2025-1-27	SH	Chile	Cherry	ZURGROUP	LAPINS	2.5	JD	120	No especificado	KG
8810	2025-1-27	SH	Chile	Cherry	BLUEP	REGINA	2*2.5	2JD	230	No especificado	KG
8811	2025-1-27	SH	Chile	Cherry	GEOFRUT	REGINA	2*2.5	J	2	No especificado	KG
8812	2025-1-27	SH	Chile	Cherry	SFG	REGINA	2*2.5	JD	2	Liquidado	KG
8813	2025-1-27	SH	Chile	Cherry	SFG	REGINA	2*2.5	JD	210	Liquidado	KG
8814	2025-1-27	SH	Chile	Cherry	SFG	REGINA	2*2.5	3JD	NaN	Liquidado	KG
8815	2025-1-27	SH	Chile	Cherry	LITU	LAPINS	5	JD	2	Liquidado	KG
8816	2025-1-27	SH	Chile	Cherry	LITU	LAPINS	5	JD	3	Liquidado	KG
8817	2025-1-27	SH	Chile	Cherry	VERFRUT	REGINA	2*2.5	2JD	3	No especificado	KG
8818	2025-1-27	SH	Chile	Cherry	SWEETCHERRIES(GREENFARM)	LAPINS	5	JD	100	Liquidado	KG
8819	2025-1-27	SH	Chile	Cherry	LOSOLMOS	REGINA	2.5	JD	2	No especificado	KG
8820	2025-1-27	SH	Chile	Cherry	鹏升	REGINA	6*2	2JD	660	Liquidado	KG
8821	2025-1-27	SH	Chile	Cherry	REDPIG	REGINA	5	JD	120	Liquidado	KG
8822	2025-1-27	SH	Chile	Cherry	REDPIG	REGINA	5	2JD	160	Liquidado	KG
8823	2025-1-27	SH	Chile	Cherry	DRAGON	LAPINS	2.5	JD	80	Liquidado	KG
8824	2025-1-27	SH	Chile	Cherry	DRAGON	LAPINS	2.5	2JD	100	Liquidado	KG
8825	2025-1-27	SH	Chile	Cherry	FRUGAL	LAPINS	2*2.5	2JD	NaN	Liquidado	KG
8826	2025-1-27	SH	Chile	Cherry	FRUGAL	LAPINS	2*2.5	3JD	NaN	Liquidado	KG
8827	2025-1-27	SH	Chile	Cherry	LOSOLMOS	LAPINS	2.5	JD	75	No especificado	KG
8828	2025-1-27	SH	Chile	Cherry	LOSOLMOS	LAPINS	2.5	4JD	130	No especificado	KG
8829	2025-1-27	SH	Chile	Cherry	WONDERFRUITS	LAPINS	2*2.5	2JD	250	Salieron 2 pallets	KG
8830	2025-1-27	SH	Chile	Cherry	WONDERFRUITS	LAPINS	2*2.5	3JD	4	Salieron 2 pallets	KG
8831	2025-1-27	SH	Chile	Cherry	POMAIRE	REGINA	5	J	2	No especificado	KG
8832	2025-1-27	SH	Chile	Cherry	NATURESOUTH	LAPINS	2*2.5	JD	NaN	Liquidado	KG
8833	2025-1-27	SH	Chile	Cherry	NATURESOUTH	LAPINS	2*2.5	2JD	NaN	Liquidado	KG
8834	2025-1-27	SH	Chile	Cherry	NATURESOUTH	LAPINS	2*2.5	3JD	3	Liquidado	KG
8835	2025-1-27	SH	Chile	Cherry	KUDE	LAPINS	2*2.5	JD	2	No especificado	KG
8836	2025-1-27	SH	Chile	Cherry	KUDE	LAPINS	2*2.5	3JD	4	No especificado	KG
8837	2025-1-27	SH	Chile	Cherry	GARCES	REGINA	2	2JD	3	Liquidado	KG
8838	2025-1-27	SH	Chile	Cherry	SFC	REGINA	2*2.5	JD	160	Liquidado	KG
8839	2025-1-27	SH	Chile	Cherry	SFC	REGINA	2*2.5	2JD	210	Liquidado	KG
8840	2025-1-27	SH	Chile	Cherry	SFC	REGINA	2*2.5	3JD	260	Liquidado	KG
8841	2025-1-27	SH	Chile	Cherry	RIOBLANCO	REGINA	2.5	JD	3	No especificado	KG
8842	2025-1-27	SH	Chile	Cherry	RIOBLANCO	REGINA	2.5	JD	1204	No especificado	KG
8843	2025-1-27	SH	Chile	Cherry	LUCKY	KORDIA	5	2JD	2	Liquidado	KG
8844	2025-1-27	SH	Chile	Cherry	南山	REGINA	2.5	2J	2	No especificado	KG
8845	2025-1-27	SH	Chile	Cherry	GARCES	LAPINS	2*2.5	2JD	NaN	Liquidado	KG
8846	2025-1-27	SH	Chile	Cherry	MISSO	LAPINS	2.5	J	140	No especificado	KG
8847	2025-1-27	SH	Chile	Cherry	MISSO	LAPINS	2.5	JD	150	No especificado	KG
8848	2025-1-27	SH	Chile	Cherry	MISSO	LAPINS	2.5	2J	190	No especificado	KG
8849	2025-1-27	SH	Chile	Cherry	MISSO	LAPINS	2.5	3J	240	No especificado	KG
8850	2025-1-27	SH	Chile	Cherry	GOLDENRABBIT	REGINA	2.5	JD	2	No especificado	KG
8851	2025-1-27	SH	Chile	Cherry	GOLDENRABBIT	REGINA	2.5	J	2	No especificado	KG
8852	2025-1-27	SH	Chile	Cherry	GOLDENRABBIT	REGINA	2.5	JD	3	No especificado	KG
8853	2025-1-27	SH	Chile	Cherry	GOLDENRABBIT	REGINA	2.5	J	3	No especificado	KG
8854	2025-1-27	SH	Chile	Cherry	CURDFEUIT	REGINA	2.5	JD	80	Liquidado	KG
8855	2025-1-27	SH	Chile	Cherry	CURDFEUIT	REGINA	2.5	2J	2	Liquidado	KG
8856	2025-1-27	SH	Chile	Cherry	CURDFEUIT	REGINA	2.5	JD	110	Liquidado	KG
8857	2025-1-27	SH	Chile	Cherry	CURDFEUIT	REGINA	2.5	3J	3	Liquidado	KG
8858	2025-1-27	SH	Chile	Cherry	CURDFEUIT	REGINA	2.5	JD	140	Liquidado	KG
8859	2025-1-27	SH	Chile	Cherry	CL	REGINA	2*2.5	JD	180	Quedaron 7 pallets	KG
8860	2025-1-27	SH	Chile	Cherry	CL	REGINA	2*2.5	2JD	240	Quedaron 7 pallets	KG
\.


--
-- Name: market_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.market_reports_id_seq', 8860, true);


--
-- Name: failed_report PK_5c094ea3c8a6b08a6a00c2a095a; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.failed_report
    ADD CONSTRAINT "PK_5c094ea3c8a6b08a6a00c2a095a" PRIMARY KEY (id);


--
-- Name: market_reports PK_6b47da73c7f8a0382be42cb72ad; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.market_reports
    ADD CONSTRAINT "PK_6b47da73c7f8a0382be42cb72ad" PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict thPs0V8yALhxF62gmFvecrgrRkq27QEHVlBU7RkWxA1OstML8hMQHo1JGNSrE2X

