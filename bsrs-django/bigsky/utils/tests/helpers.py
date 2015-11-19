import os
from os.path import dirname, join

from django.conf import settings


def remove_attachment_test_files():
    path = settings.ATTACHMENTS_DIRECTORY

    for (dirpath, dirnames, filenames) in os.walk(path):
        for name in filenames:
            if name != '.gitignore':
                try:
                    os.remove(join(dirpath, name))
                except AttributeError:
                    pass
