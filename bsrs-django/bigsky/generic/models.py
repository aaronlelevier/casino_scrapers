import os
from PIL import Image

from django.db import models
from django.conf import settings
from django.utils.encoding import python_2_unicode_compatible
from django.core.exceptions import ValidationError

from person.models import Person
from util.models import BaseModel, BaseManager, BaseSetting


### SAVED SEARCHES

@python_2_unicode_compatible
class SavedSearch(BaseModel):
    """
    So the Person can save their searches for any model.
    """
    name = models.CharField(max_length=254,
        help_text="name of the saved search that the Person designates.")
    person = models.ForeignKey(Person,
        help_text="The Person who saves the search.")
    model_id = models.UUIDField(
        help_text="Primary key of the Model that this search is saved for.")
    endpoint = models.CharField(max_length=254,
        help_text="API Endpoint that this search is saved for. With all keywords "
                  "ordering, and filters, etc...")

    class Meta:
        ordering = ('-modified',)
        verbose_name_plural = "Saved Searches"

    def __str__(self):
        return self.endpoint


### SETTINGS

class MainSetting(BaseSetting):
    pass


class CustomSetting(BaseSetting):
    pass


###############
# ATTACHMENTS #
###############

### HELPERS

IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.gif', '.png']


### FILE PATHS

def upload_to(instance, filename):
    name, extension = os.path.splitext(filename)

    if extension in IMAGE_EXTENSIONS:
        dir_ = 'images/full'
    else:
        dir_ = 'files'

    return '/'.join(['attachments/{}'.format(dir_), filename])


def upload_to_images_medium(instance, filename):
    return '/'.join(['attachments/images/medium', filename])


def upload_to_images_thumbnail(instance, filename):
    return '/'.join(['attachments/images/thumbnails', filename])


### ATTACHMENT

@python_2_unicode_compatible
class Attachment(BaseModel):
    """
    Stores a File or Image w/ multiple sizes locations in a single model.

    Will reject uploads that exceed the ``settings.MAX_UPLOAD_SIZE``

    Populate ``filename`` and ``is_image`` upon upload.

    `MIME Types reference <http://www.sitepoint.com/web-foundations/mime-types-complete-list/>`_
    """
    model_id = models.UUIDField(help_text="UUID of the Model Instance that "
                                          "the Attachment is related to.")
    filename = models.CharField(max_length=100, blank=True)
    file = models.FileField(upload_to=upload_to, null=True, blank=True)
    is_image = models.BooleanField(blank=True, default=False)
    image_full = models.ImageField(upload_to=upload_to, null=True, blank=True)
    image_medium = models.ImageField(upload_to=upload_to_images_medium, null=True, blank=True)
    image_thumbnail = models.ImageField(upload_to=upload_to_images_thumbnail, null=True, blank=True)

    def __str__(self):
        return self.filename

    def save(self, *args, **kwargs):
        """
        Only the ``model_id`` and the ``file`` field will be available. After being sent,
        if it an Image, set the ``file=None``, and use the Image Fields.
        """
        self._validate_file_size()

        self.filename = self._filename

        name, extension = os.path.splitext(self.file.name)

        if extension in IMAGE_EXTENSIONS:
            # Mark as Image
            self.is_image = True
            # Save Image Sizes
            self.image_full = self.file
            # Set file=None b/c we are storing an Image
            self.file = None

        return super(Attachment, self).save(*args, **kwargs)

    @property
    def _filename(self):
        try:
            return os.path.abspath(self.file.name).split("/")[-1]
        except AttributeError:
            return self.file.name

    @property
    def image_extensions(self):
        return ['jpg', 'jpeg', 'gif', 'png']

    def _validate_file_size(self):
        try:
            if self.file._file._size > settings.MAX_UPLOAD_SIZE:
                raise ValidationError("File size: {} to big".format(
                    self.file._file._size))
        except AttributeError:
            pass