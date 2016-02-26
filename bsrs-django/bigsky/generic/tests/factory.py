import os
from os.path import join

from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile

from model_mommy import mommy

from generic.models import Attachment


def create_attachments(ticket=None):
    file = join(settings.MEDIA_ROOT, "test_in/es.csv")
    file_filename = os.path.split(file)[1]
    with open(file, 'rb') as infile:
        _file = SimpleUploadedFile(file_filename, infile.read())

        ticket_kwargs = {}
        if ticket:
            ticket_kwargs.update({
                'content_object': ticket,
                'object_id': ticket.id
            })

        return Attachment.objects.create(file=_file, **ticket_kwargs)
