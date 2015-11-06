install-postgresql:
  pkg.installed:
    - name: postgresql93

run-postgresql:
  service.running:
    - enable: true
    - name: postgresql-9.3
    - require:
      - pkg: postgresql93

postgresql93-contrib:
  pkg.installed

postgresql93-devel:
  pkg.installed

postgresql93-libs:
  pkg.installed

postgresql93-server:
  pkg.installed

python-psycopg2:
  pkg.installed

db:
  postgres_database.present:
    - name: persistent
    - db_user: bsdev
    - db_password: tango
    - db_port: 5432
    - user: tomcat

postgres-user-bsdev:
  postgres_user.present:
    - name: bsdev
    - password: tango
    - user: tomcat
    - db_user: bsdev
    - db_password: tango
    - db_port: 5432
    - require:
      - pkg: postgresql93
      - service: run-postgresql
