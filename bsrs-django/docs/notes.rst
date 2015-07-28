Notes
=====

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
.. code-block::

    # kill all
    killall -s INT uwsgi

    # kill by port #
    fuser -k -n tcp $UWSGI_PORT
