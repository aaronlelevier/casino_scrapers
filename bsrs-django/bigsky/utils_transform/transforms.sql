--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: auth_group; Type: TABLE; Schema: public; Owner: bsdev; Tablespace: 
--

CREATE TABLE auth_group (
    id integer NOT NULL,
    name character varying(80) NOT NULL
);


ALTER TABLE auth_group OWNER TO bsdev;

--
-- Name: auth_group_id_seq; Type: SEQUENCE; Schema: public; Owner: bsdev
--

CREATE SEQUENCE auth_group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE auth_group_id_seq OWNER TO bsdev;

--
-- Name: auth_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bsdev
--

ALTER SEQUENCE auth_group_id_seq OWNED BY auth_group.id;


--
-- Name: auth_group_permissions; Type: TABLE; Schema: public; Owner: bsdev; Tablespace: 
--

CREATE TABLE auth_group_permissions (
    id integer NOT NULL,
    group_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE auth_group_permissions OWNER TO bsdev;

--
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: bsdev
--

CREATE SEQUENCE auth_group_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE auth_group_permissions_id_seq OWNER TO bsdev;

--
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bsdev
--

ALTER SEQUENCE auth_group_permissions_id_seq OWNED BY auth_group_permissions.id;


--
-- Name: auth_permission; Type: TABLE; Schema: public; Owner: bsdev; Tablespace: 
--

CREATE TABLE auth_permission (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    content_type_id integer NOT NULL,
    codename character varying(100) NOT NULL
);


ALTER TABLE auth_permission OWNER TO bsdev;

--
-- Name: auth_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: bsdev
--

CREATE SEQUENCE auth_permission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE auth_permission_id_seq OWNER TO bsdev;

--
-- Name: auth_permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bsdev
--

ALTER SEQUENCE auth_permission_id_seq OWNED BY auth_permission.id;


--
-- Name: django_content_type; Type: TABLE; Schema: public; Owner: bsdev; Tablespace: 
--

CREATE TABLE django_content_type (
    id integer NOT NULL,
    app_label character varying(100) NOT NULL,
    model character varying(100) NOT NULL
);


ALTER TABLE django_content_type OWNER TO bsdev;

--
-- Name: django_content_type_id_seq; Type: SEQUENCE; Schema: public; Owner: bsdev
--

CREATE SEQUENCE django_content_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE django_content_type_id_seq OWNER TO bsdev;

--
-- Name: django_content_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bsdev
--

ALTER SEQUENCE django_content_type_id_seq OWNED BY django_content_type.id;


--
-- Name: django_migrations; Type: TABLE; Schema: public; Owner: bsdev; Tablespace: 
--

CREATE TABLE django_migrations (
    id integer NOT NULL,
    app character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    applied timestamp with time zone NOT NULL
);


ALTER TABLE django_migrations OWNER TO bsdev;

--
-- Name: django_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: bsdev
--

CREATE SEQUENCE django_migrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE django_migrations_id_seq OWNER TO bsdev;

--
-- Name: django_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bsdev
--

ALTER SEQUENCE django_migrations_id_seq OWNED BY django_migrations.id;


--
-- Name: django_site; Type: TABLE; Schema: public; Owner: bsdev; Tablespace: 
--

CREATE TABLE django_site (
    id integer NOT NULL,
    domain character varying(100) NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE django_site OWNER TO bsdev;

--
-- Name: django_site_id_seq; Type: SEQUENCE; Schema: public; Owner: bsdev
--

CREATE SEQUENCE django_site_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE django_site_id_seq OWNER TO bsdev;

--
-- Name: django_site_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bsdev
--

ALTER SEQUENCE django_site_id_seq OWNED BY django_site.id;


--
-- Name: tlocation_location; Type: TABLE; Schema: public; Owner: bsdev; Tablespace: 
--

CREATE TABLE tlocation_location (
    id integer NOT NULL,
    number text NOT NULL,
    name text NOT NULL,
    manager text NOT NULL,
    address1 text NOT NULL,
    address2 text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    zip text NOT NULL,
    country text NOT NULL,
    telephone text NOT NULL,
    fax text NOT NULL,
    email text NOT NULL,
    carphone text NOT NULL,
    comments text NOT NULL
);


ALTER TABLE tlocation_location OWNER TO bsdev;

--
-- Name: tlocation_location_id_seq; Type: SEQUENCE; Schema: public; Owner: bsdev
--

CREATE SEQUENCE tlocation_location_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE tlocation_location_id_seq OWNER TO bsdev;

--
-- Name: tlocation_location_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bsdev
--

ALTER SEQUENCE tlocation_location_id_seq OWNED BY tlocation_location.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: bsdev
--

ALTER TABLE ONLY auth_group ALTER COLUMN id SET DEFAULT nextval('auth_group_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: bsdev
--

ALTER TABLE ONLY auth_group_permissions ALTER COLUMN id SET DEFAULT nextval('auth_group_permissions_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: bsdev
--

ALTER TABLE ONLY auth_permission ALTER COLUMN id SET DEFAULT nextval('auth_permission_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: bsdev
--

ALTER TABLE ONLY django_content_type ALTER COLUMN id SET DEFAULT nextval('django_content_type_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: bsdev
--

ALTER TABLE ONLY django_migrations ALTER COLUMN id SET DEFAULT nextval('django_migrations_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: bsdev
--

ALTER TABLE ONLY django_site ALTER COLUMN id SET DEFAULT nextval('django_site_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: bsdev
--

ALTER TABLE ONLY tlocation_location ALTER COLUMN id SET DEFAULT nextval('tlocation_location_id_seq'::regclass);


--
-- Data for Name: auth_group; Type: TABLE DATA; Schema: public; Owner: bsdev
--

COPY auth_group (id, name) FROM stdin;
\.


--
-- Name: auth_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bsdev
--

SELECT pg_catalog.setval('auth_group_id_seq', 1, false);


--
-- Data for Name: auth_group_permissions; Type: TABLE DATA; Schema: public; Owner: bsdev
--

COPY auth_group_permissions (id, group_id, permission_id) FROM stdin;
\.


--
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bsdev
--

SELECT pg_catalog.setval('auth_group_permissions_id_seq', 1, false);


--
-- Data for Name: auth_permission; Type: TABLE DATA; Schema: public; Owner: bsdev
--

COPY auth_permission (id, name, content_type_id, codename) FROM stdin;
1	Can add log entry	1	add_logentry
2	Can change log entry	1	change_logentry
3	Can delete log entry	1	delete_logentry
4	Can add permission	2	add_permission
5	Can change permission	2	change_permission
6	Can delete permission	2	delete_permission
7	Can add group	3	add_group
8	Can change group	3	change_group
9	Can delete group	3	delete_group
10	Can add content type	4	add_contenttype
11	Can change content type	4	change_contenttype
12	Can delete content type	4	delete_contenttype
13	Can add session	5	add_session
14	Can change session	5	change_session
15	Can delete session	5	delete_session
16	Can add site	6	add_site
17	Can change site	6	change_site
18	Can delete site	6	delete_site
19	Can add flat page	7	add_flatpage
20	Can change flat page	7	change_flatpage
21	Can delete flat page	7	delete_flatpage
22	Can add cors model	8	add_corsmodel
23	Can change cors model	8	change_corsmodel
24	Can delete cors model	8	delete_corsmodel
25	Can add currency	9	add_currency
26	Can change currency	9	change_currency
27	Can delete currency	9	delete_currency
28	Can add category status	10	add_categorystatus
29	Can change category status	10	change_categorystatus
30	Can delete category status	10	delete_categorystatus
31	Can add category	11	add_category
32	Can change category	11	change_category
33	Can delete category	11	delete_category
34	Can add phone number type	12	add_phonenumbertype
35	Can change phone number type	12	change_phonenumbertype
36	Can delete phone number type	12	delete_phonenumbertype
37	Can add phone number	13	add_phonenumber
38	Can change phone number	13	change_phonenumber
39	Can delete phone number	13	delete_phonenumber
40	Can add address type	14	add_addresstype
41	Can change address type	14	change_addresstype
42	Can delete address type	14	delete_addresstype
43	Can add address	15	add_address
44	Can change address	15	change_address
45	Can delete address	15	delete_address
46	Can add email type	16	add_emailtype
47	Can change email type	16	change_emailtype
48	Can delete email type	16	delete_emailtype
49	Can add email	17	add_email
50	Can change email	17	change_email
51	Can delete email	17	delete_email
52	Can add saved search	18	add_savedsearch
53	Can change saved search	18	change_savedsearch
54	Can delete saved search	18	delete_savedsearch
55	Can add main setting	19	add_mainsetting
56	Can change main setting	19	change_mainsetting
57	Can delete main setting	19	delete_mainsetting
58	Can add custom setting	20	add_customsetting
59	Can change custom setting	20	change_customsetting
60	Can delete custom setting	20	delete_customsetting
61	Can add attachment	21	add_attachment
62	Can change attachment	21	change_attachment
63	Can delete attachment	21	delete_attachment
64	Can add state	22	add_state
65	Can change state	22	change_state
66	Can delete state	22	delete_state
67	Can add country	23	add_country
68	Can change country	23	change_country
69	Can delete country	23	delete_country
70	Can add location level	24	add_locationlevel
71	Can change location level	24	change_locationlevel
72	Can delete location level	24	delete_locationlevel
73	Can add location status	25	add_locationstatus
74	Can change location status	25	change_locationstatus
75	Can delete location status	25	delete_locationstatus
76	Can add location type	26	add_locationtype
77	Can change location type	26	change_locationtype
78	Can delete location type	26	delete_locationtype
79	Can add location	27	add_location
80	Can change location	27	change_location
81	Can delete location	27	delete_location
82	Can add work order status	28	add_workorderstatus
83	Can change work order status	28	change_workorderstatus
84	Can delete work order status	28	delete_workorderstatus
85	Can add work order	29	add_workorder
86	Can change work order	29	change_workorder
87	Can delete work order	29	delete_workorder
88	Can add role	30	add_role
89	Can change role	30	change_role
90	Can delete role	30	delete_role
91	Can add proxy role	31	add_proxyrole
92	Can change proxy role	31	change_proxyrole
93	Can delete proxy role	31	delete_proxyrole
94	Can add person status	32	add_personstatus
95	Can change person status	32	change_personstatus
96	Can delete person status	32	delete_personstatus
97	Can add person	33	add_person
98	Can change person	33	change_person
99	Can delete person	33	delete_person
100	Can add third party status	34	add_thirdpartystatus
101	Can change third party status	34	change_thirdpartystatus
102	Can delete third party status	34	delete_thirdpartystatus
103	Can add third party	35	add_thirdparty
104	Can change third party	35	change_thirdparty
105	Can delete third party	35	delete_thirdparty
106	Can add ticket status	36	add_ticketstatus
107	Can change ticket status	36	change_ticketstatus
108	Can delete ticket status	36	delete_ticketstatus
109	Can add ticket priority	37	add_ticketpriority
110	Can change ticket priority	37	change_ticketpriority
111	Can delete ticket priority	37	delete_ticketpriority
112	Can add ticket	38	add_ticket
113	Can change ticket	38	change_ticket
114	Can delete ticket	38	delete_ticket
115	Can add ticket activity type	39	add_ticketactivitytype
116	Can change ticket activity type	39	change_ticketactivitytype
117	Can delete ticket activity type	39	delete_ticketactivitytype
118	Can add ticket activity	40	add_ticketactivity
119	Can change ticket activity	40	change_ticketactivity
120	Can delete ticket activity	40	delete_ticketactivity
121	Can add locale	41	add_locale
122	Can change locale	41	change_locale
123	Can delete locale	41	delete_locale
124	Can add translation	42	add_translation
125	Can change translation	42	change_translation
126	Can delete translation	42	delete_translation
127	Can add work request status	43	add_workrequeststatus
128	Can change work request status	43	change_workrequeststatus
129	Can delete work request status	43	delete_workrequeststatus
130	Can add work request	44	add_workrequest
131	Can change work request	44	change_workrequest
132	Can delete work request	44	delete_workrequest
133	Can add tester	45	add_tester
134	Can change tester	45	change_tester
135	Can delete tester	45	delete_tester
136	Can add location	46	add_location
137	Can change location	46	change_location
138	Can delete location	46	delete_location
\.


--
-- Name: auth_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bsdev
--

SELECT pg_catalog.setval('auth_permission_id_seq', 138, true);


--
-- Data for Name: django_content_type; Type: TABLE DATA; Schema: public; Owner: bsdev
--

COPY django_content_type (id, app_label, model) FROM stdin;
1	admin	logentry
2	auth	permission
3	auth	group
4	contenttypes	contenttype
5	sessions	session
6	sites	site
7	flatpages	flatpage
8	corsheaders	corsmodel
9	accounting	currency
10	category	categorystatus
11	category	category
12	contact	phonenumbertype
13	contact	phonenumber
14	contact	addresstype
15	contact	address
16	contact	emailtype
17	contact	email
18	generic	savedsearch
19	generic	mainsetting
20	generic	customsetting
21	generic	attachment
22	location	state
23	location	country
24	location	locationlevel
25	location	locationstatus
26	location	locationtype
27	location	location
28	order	workorderstatus
29	order	workorder
30	person	role
31	person	proxyrole
32	person	personstatus
33	person	person
34	third_party	thirdpartystatus
35	third_party	thirdparty
36	ticket	ticketstatus
37	ticket	ticketpriority
38	ticket	ticket
39	ticket	ticketactivitytype
40	ticket	ticketactivity
41	translation	locale
42	translation	translation
43	work_request	workrequeststatus
44	work_request	workrequest
45	utils	tester
46	tlocation	location
\.


--
-- Name: django_content_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bsdev
--

SELECT pg_catalog.setval('django_content_type_id_seq', 46, true);


--
-- Data for Name: django_migrations; Type: TABLE DATA; Schema: public; Owner: bsdev
--

COPY django_migrations (id, app, name, applied) FROM stdin;
1	sites	0001_initial	2015-12-09 13:51:14.503007-08
2	contenttypes	0001_initial	2015-12-09 13:51:15.355168-08
3	contenttypes	0002_remove_content_type_name	2015-12-09 13:51:15.37521-08
4	auth	0001_initial	2015-12-09 13:51:15.419936-08
5	auth	0002_alter_permission_name_max_length	2015-12-09 13:51:15.43129-08
6	auth	0003_alter_user_email_max_length	2015-12-09 13:51:15.441666-08
7	auth	0004_alter_user_username_opts	2015-12-09 13:51:15.453222-08
8	auth	0005_alter_user_last_login_null	2015-12-09 13:51:15.463094-08
9	auth	0006_require_contenttypes_0002	2015-12-09 13:51:15.464839-08
10	tlocation	0001_initial	2015-12-09 13:51:17.478915-08
\.


--
-- Name: django_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bsdev
--

SELECT pg_catalog.setval('django_migrations_id_seq', 10, true);


--
-- Data for Name: django_site; Type: TABLE DATA; Schema: public; Owner: bsdev
--

COPY django_site (id, domain, name) FROM stdin;
1	example.com	example.com
\.


--
-- Name: django_site_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bsdev
--

SELECT pg_catalog.setval('django_site_id_seq', 1, true);


--
-- Data for Name: tlocation_location; Type: TABLE DATA; Schema: public; Owner: bsdev
--

COPY tlocation_location (id, number, name, manager, address1, address2, city, state, zip, country, telephone, fax, email, carphone, comments) FROM stdin;
\.


--
-- Name: tlocation_location_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bsdev
--

SELECT pg_catalog.setval('tlocation_location_id_seq', 1, false);


--
-- Name: auth_group_name_key; Type: CONSTRAINT; Schema: public; Owner: bsdev; Tablespace: 
--

ALTER TABLE ONLY auth_group
    ADD CONSTRAINT auth_group_name_key UNIQUE (name);


--
-- Name: auth_group_permissions_group_id_permission_id_key; Type: CONSTRAINT; Schema: public; Owner: bsdev; Tablespace: 
--

ALTER TABLE ONLY auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_permission_id_key UNIQUE (group_id, permission_id);


--
-- Name: auth_group_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: bsdev; Tablespace: 
--

ALTER TABLE ONLY auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_pkey PRIMARY KEY (id);


--
-- Name: auth_group_pkey; Type: CONSTRAINT; Schema: public; Owner: bsdev; Tablespace: 
--

ALTER TABLE ONLY auth_group
    ADD CONSTRAINT auth_group_pkey PRIMARY KEY (id);


--
-- Name: auth_permission_content_type_id_codename_key; Type: CONSTRAINT; Schema: public; Owner: bsdev; Tablespace: 
--

ALTER TABLE ONLY auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_codename_key UNIQUE (content_type_id, codename);


--
-- Name: auth_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: bsdev; Tablespace: 
--

ALTER TABLE ONLY auth_permission
    ADD CONSTRAINT auth_permission_pkey PRIMARY KEY (id);


--
-- Name: django_content_type_app_label_63a1d87a66eaaa31_uniq; Type: CONSTRAINT; Schema: public; Owner: bsdev; Tablespace: 
--

ALTER TABLE ONLY django_content_type
    ADD CONSTRAINT django_content_type_app_label_63a1d87a66eaaa31_uniq UNIQUE (app_label, model);


--
-- Name: django_content_type_pkey; Type: CONSTRAINT; Schema: public; Owner: bsdev; Tablespace: 
--

ALTER TABLE ONLY django_content_type
    ADD CONSTRAINT django_content_type_pkey PRIMARY KEY (id);


--
-- Name: django_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: bsdev; Tablespace: 
--

ALTER TABLE ONLY django_migrations
    ADD CONSTRAINT django_migrations_pkey PRIMARY KEY (id);


--
-- Name: django_site_pkey; Type: CONSTRAINT; Schema: public; Owner: bsdev; Tablespace: 
--

ALTER TABLE ONLY django_site
    ADD CONSTRAINT django_site_pkey PRIMARY KEY (id);


--
-- Name: tlocation_location_pkey; Type: CONSTRAINT; Schema: public; Owner: bsdev; Tablespace: 
--

ALTER TABLE ONLY tlocation_location
    ADD CONSTRAINT tlocation_location_pkey PRIMARY KEY (id);


--
-- Name: auth_group_name_37ced14d4902cd1e_like; Type: INDEX; Schema: public; Owner: bsdev; Tablespace: 
--

CREATE INDEX auth_group_name_37ced14d4902cd1e_like ON auth_group USING btree (name varchar_pattern_ops);


--
-- Name: auth_group_permissions_0e939a4f; Type: INDEX; Schema: public; Owner: bsdev; Tablespace: 
--

CREATE INDEX auth_group_permissions_0e939a4f ON auth_group_permissions USING btree (group_id);


--
-- Name: auth_group_permissions_8373b171; Type: INDEX; Schema: public; Owner: bsdev; Tablespace: 
--

CREATE INDEX auth_group_permissions_8373b171 ON auth_group_permissions USING btree (permission_id);


--
-- Name: auth_permission_417f1b1c; Type: INDEX; Schema: public; Owner: bsdev; Tablespace: 
--

CREATE INDEX auth_permission_417f1b1c ON auth_permission USING btree (content_type_id);


--
-- Name: auth_content_type_id_18a7d324c8e7b27c_fk_django_content_type_id; Type: FK CONSTRAINT; Schema: public; Owner: bsdev
--

ALTER TABLE ONLY auth_permission
    ADD CONSTRAINT auth_content_type_id_18a7d324c8e7b27c_fk_django_content_type_id FOREIGN KEY (content_type_id) REFERENCES django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_group_permissio_group_id_72228d52f3fa09be_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: bsdev
--

ALTER TABLE ONLY auth_group_permissions
    ADD CONSTRAINT auth_group_permissio_group_id_72228d52f3fa09be_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_group_permission_id_3e17e9cfb3e1a9f5_fk_auth_permission_id; Type: FK CONSTRAINT; Schema: public; Owner: bsdev
--

ALTER TABLE ONLY auth_group_permissions
    ADD CONSTRAINT auth_group_permission_id_3e17e9cfb3e1a9f5_fk_auth_permission_id FOREIGN KEY (permission_id) REFERENCES auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: public; Type: ACL; Schema: -; Owner: alelevier
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM alelevier;
GRANT ALL ON SCHEMA public TO alelevier;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

