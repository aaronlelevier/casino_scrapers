import os
from os.path import join

from django.conf import settings

from celery import current_app


def remove_attachment_test_files():
    path = settings.ATTACHMENTS_DIRECTORY

    for (dirpath, dirnames, filenames) in os.walk(path):
        for name in filenames:
            if name != '.gitignore':
                try:
                    os.remove(join(dirpath, name))
                except AttributeError:
                    pass


def build_dict(seq, key):
    return dict((d[key], dict(d, index=i)) for (i, d) in enumerate(seq))


def celery_set_eager():
    settings.CELERY_ALWAYS_EAGER = True
    current_app.conf.CELERY_ALWAYS_EAGER = True
    settings.CELERY_EAGER_PROPAGATES_EXCEPTIONS = True
    current_app.conf.CELERY_EAGER_PROPAGATES_EXCEPTIONS = True
