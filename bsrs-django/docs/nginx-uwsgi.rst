Nginx
=====

Uwsgi
=====

.. code-block::

    # test.py
    uwsgi --http :8003 --wsgi-file test.py

    # w/ django - simple
    uwsgi --http :8003 --chdir /www/django/releases/persistent/bsrs/python3/ --wsgi-file bigsky.wsgi --no-site