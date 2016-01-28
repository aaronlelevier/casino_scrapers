import uuid

from django.db import models

from model_mommy import mommy

from generic.models import Attachment, Setting
from generic.settings import DEFAULT_GENERAL_SETTINGS
from utils.create import _generate_chars


def create_attachments(ticket=None):
    global Attachment
    Attachment.save = models.Model.save
    filename = _generate_chars()
    file = _generate_chars()
    return mommy.make(Attachment, id=str(uuid.uuid4()), filename=filename, file=file, ticket=ticket)


def create_general_setting():
    return Setting.objects.create(name='general', settings=DEFAULT_GENERAL_SETTINGS)
