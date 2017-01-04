from setuptools import setup, find_packages

setup (
        name = "bsrs",
        version = "0.4.0",
        description = "Django service",
        packages = find_packages(),
        include_package_data = True,
        scripts = ["bigsky/manage.py"],
        install_requires = [
            "Django==1.9.6",
            "django-cors-headers==1.1.0",
            "django-extensions==1.6.1",
            "django-fsm==2.3.0",
            "djangorestframework==3.3.2",
            "django-debug-toolbar==1.4",
            "model-mommy==1.2.6",
            "beautifulsoup4==4.4.0",
            "docutils==0.12",
            "funcsigs==0.4",
            "Markdown==2.6.2",
            "jsonschema==2.5.1",
            "mock==1.3.0",
            "pbr==1.4.0",
            "Pillow==3.0.0",
            "Pmw==2.0.0",
            "preppy==2.3.4",
            "psycopg2==2.6.1",
            "py==1.4.30",
            "PyJWT==1.4.0",
            "pyRXP==2.1.0",
            "pytz==2015.4",
            "reportlab==3.2.0",
            "six==1.10.0",
            "snowballstemmer==1.2.0",
            "sqlparse==0.1.18",
            "waitress==0.8.9",
            "WebOb==1.4.1",
            "WebTest==2.0.18",
            "wheel==0.29.0",
            "httplib2==0.9.2",
            "oauth2client==2.0.2",
            "pyasn1==0.1.9",
            "pyasn1-modules==0.0.8",
            "rsa==3.4.2",
            "PyOpenSSL==16.0.0",
            "cffi==1.6.0",
            "cryptography==1.3.1",
            "idna==2.1",
            "pycparser==2.14",
            "gspread==0.3.0",
            "requests==2.9.1",
            "amqp==1.4.9",
            "anyjson==0.3.3",
            "billiard==3.3.0.23",
            "celery==3.1.23",
            "kombu==3.0.35",
            "django-redis==4.4.2",
            "redis==2.10.5",
            "uwsgi>=2.0"
            ],
        extras_require = {
                "test": [
                    "coverage>=3.7.1",
                    "django-coverage>=1.2.4",
                    "nose>=1.3.7",
                    "nose-exclude>=0.4.1",
                    "django-nose>=1.4.2",
                    "selenium>=2.52.0",
                    "pinocchio>=0.4.2"
                    ]
                },
        )

