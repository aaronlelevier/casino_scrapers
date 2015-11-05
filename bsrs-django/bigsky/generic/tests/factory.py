import uuid

from django.db import models

from model_mommy import mommy

from generic.models import Attachment


def create_attachments():
    global Attachment
    Attachment.save = models.Model.save
    return mommy.make(Attachment, id=str(uuid.uuid4()))
