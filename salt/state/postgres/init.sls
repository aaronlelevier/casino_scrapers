install-postgresql:
    pkg.installed:
        - pkgs:
            - postgresql
            - postgresql93-contrib
            - postgresql93-devel
            - postgresql93-libs
            - postgresql93-server
            - python-psycopg2
