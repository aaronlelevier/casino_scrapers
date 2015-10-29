Notes
=====


Meteor
------
universal Js

problems with MongoDB - instead S3 buckets

Casandra - document DB

Client access to the DB, and PW present in the Client

Their own package manager - instant friction w/ other package managers

owned by a company



Package Manager
---------------
jspm


BaseCamp
--------
Work w/ Toran for coordinating Django stuff

Dates are thought of somewhat more as reminder dates than due dates


Vagrant Random Commands
-----------------------

.. code-block::

    # restart vagrant
    sudo shutdown -r now


Vagrant
-------
2 parts:

    1. what are the servers dependencies to run the web app at all?
    2. how do I copy the django server over n symlink nginx?


UUID
----
Stack overflow answer on `advantages <http://stackoverflow.com/a/45479/1913888>`_

`Probability <https://en.wikipedia.org/wiki/Universally_unique_identifier#Random%5FUUID%5Fprobability%5Fof%5Fduplicates>`_ of UUID duplicates.

Auto-generate for UUID's for `Django <https://docs.djangoproject.com/en/1.8/ref/models/fields/#django.db.models.UUIDField>`_


uWSGI
-----

`kill with uwsgi docs <http://uwsgi-docs.readthedocs.org/en/latest/Management.html#stopping-the-server>`_

.. code-block::

    # kill all
    killall -s INT uwsgi

    # kill by port #
    fuser -k -n tcp $UWSGI_PORT


Linux
-----
.. code-block::
    
    # find file
    sudo find . -name "<filename>"


Translation
-----------
``django.middleware.locale.LocaleMiddleware`` to specify Location that Django searches
for to do translations.