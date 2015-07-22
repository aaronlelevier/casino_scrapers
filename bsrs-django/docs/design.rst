Design Decisions
================

TextField vs. CharField
-----------------------
No performance difference as stated `here <http://stackoverflow.com/a/7354680/1913888>`_

Unless using ``Full Text Search``, where CharField would then be preferrable:

    - http://stackoverflow.com/a/8698298

Django Attachment Libs
----------------------
`django_imagekit <https://github.com/matthewwithanm/django-imagekit>`_

Database Includes
-----------------
States n provinces from around the world that that Ember will need
