import os
from os.path import join

from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile

from model_mommy import mommy

from generic.models import Attachment


def create_file_attachment(related_object=None, test_file="test_in/es.csv"):
    file = join(settings.MEDIA_ROOT, test_file)
    file_filename = os.path.split(file)[1]
    with open(file, 'rb') as infile:
        _file = SimpleUploadedFile(file_filename, infile.read())

        kwargs = {}
        if related_object:
            kwargs.update({
                'content_object': related_object,
                'object_id': related_object.id
            })

        return Attachment.objects.create(file=_file, **kwargs)


def create_image_attachment(related_object=None, test_file="test_in/aaron.jpeg"):
    return create_file_attachment(related_object=related_object, test_file=test_file)
