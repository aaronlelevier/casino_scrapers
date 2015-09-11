from django.db import models

from util.models import BaseModel, BaseManager


### FILE PATHS

def upload_to_files(instance, filename):
    return '/'.join(['attachments/files', filename])


def upload_to_images_thumbnail(instance, filename):
    return '/'.join(['attachments/images/thumbnails', filename])


def upload_to_images_medium(instance, filename):
    return '/'.join(['attachments/images/medium', filename])


def upload_to_images_full(instance, filename):
    return '/'.join(['attachments/images/full', filename])


### ATTACHMENT

class Attachment(BaseModel):
    model_id = models.UUIDField(help_text="UUID of the Model for which this Attachment applies.")
    filename = models.CharField(max_length=100, blank=True)
    file = models.FileField(upload_to=upload_to_files, null=True, blank=True)
    is_image = models.BooleanField(blank=True, default=False)
    image_thumbnail = models.ImageField(upload_to=upload_to_images_thumbnail, null=True, blank=True)
    image_medium = models.ImageField(upload_to=upload_to_images_medium, null=True, blank=True)
    image_full = models.ImageField(upload_to=upload_to_images_full, null=True, blank=True)