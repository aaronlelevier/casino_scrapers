import os
from PIL import Image

from django.db import models
from django.conf import settings
from django.utils.encoding import python_2_unicode_compatible
from django.core.exceptions import ValidationError

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

@python_2_unicode_compatible
class Attachment(BaseModel):
    """
    Stores a File or Image w/ multiple sizes locations in a single model.

    Will reject uploads that exceed the ``settings.MAX_UPLOAD_SIZE``

    Populate ``filename`` and ``is_image`` upon upload.
    """
    model_id = models.UUIDField(help_text="UUID of the Model Instance that "
                                          "the Attachment is related to.")
    filename = models.CharField(max_length=100, blank=True)
    file = models.FileField(upload_to=upload_to_files, null=True, blank=True)
    is_image = models.BooleanField(blank=True, default=False)
    image_thumbnail = models.ImageField(upload_to=upload_to_images_thumbnail, null=True, blank=True)
    image_medium = models.ImageField(upload_to=upload_to_images_medium, null=True, blank=True)
    image_full = models.ImageField(upload_to=upload_to_images_full, null=True, blank=True)

    def __str__(self):
        return self.filename

    def save(self, *args, **kwargs):
        """
        Only the ``model_id`` and the ``file`` field will be available. After being sent,
        if it an Image, set the ``file=None``, and use the Image Fields.
        """

        # Validate Size OK
        if self.file._file._size > settings.MAX_UPLOAD_SIZE:
            raise ValidationError("File size: {} to big".format(
                self.file._file._size))

        self.filename, extension = self.filename_and_extension
        if extension in self.image_extensions:
            # Mark as Image
            self.is_image = True
            # Save Image Sizes
            self.image_full = self.file
            # Set file=None b/c we are storing an Image
            self.file = None

        return super(Attachment, self).save(*args, **kwargs)

    @property
    def filename_and_extension(self):
        try:
            name = os.path.abspath(self.file.name).split("/")[-1]
        except AttributeError:
            name = self.file.name
        extension = name.split(".")[-1]
        return name, extension

    @property
    def image_extensions(self):
        return ['JPG', 'JPEG', 'GIF', 'PNG']








