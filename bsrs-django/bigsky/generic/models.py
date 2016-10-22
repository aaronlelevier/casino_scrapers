import os

from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.contenttypes.models import ContentType

from PIL import Image
from rest_framework.exceptions import ValidationError

from utils.helpers import media_path
from utils.fields import MyGenericForeignKey
from utils.models import BaseModel, BaseManager, BaseQuerySet


### SAVED SEARCHES

class SavedSearchManager(BaseManager):

    def person_saved_searches(self, person):
        """Used for bootsrapping the Person's SavedSearch's in the
        bootsrap config."""
        return [x.to_dict() for x in self.filter(person=person)]


class SavedSearch(BaseModel):
    """
    So the Person can save their searches for any model.
    """
    name = models.CharField(max_length=254,
        help_text="name of the saved search that the Person designates.")
    person = models.ForeignKey(settings.AUTH_USER_MODEL,
        help_text="The Person who saves the search.")
    endpoint_name = models.CharField(max_length=254,
        help_text="the Ember List API route name. i.e. 'admin.people.index'.")
    endpoint_uri = models.CharField(max_length=2048,
        help_text="API Endpoint that this search is saved for. With all keywords "
                  "ordering, and filters, etc...")

    objects = SavedSearchManager()

    class Meta:
        ordering = ('-modified',)
        verbose_name_plural = "Saved searches"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.validate_endpoint_name()
        self.validate_person_name_unique()
        return super(SavedSearch, self).save(*args, **kwargs)

    def validate_endpoint_name(self):
        from bigsky.urls import router
        if self.endpoint_name not in [".".join(x[0].split('/'))+".index" if "index" in self.endpoint_name 
                else ".".join(x[0].split('/')) for x in router.registry]:
            raise DjangoValidationError("{} is not a valid Ember List API endpoint name."
                .format(self.endpoint_name))

    def validate_person_name_unique(self):
        """Use ``self.created`` check, so this validator will only be triggered
        when creating new records."""
        if not self.created and SavedSearch.objects.filter(
            person=self.person, name=self.name, endpoint_name=self.endpoint_name).exists():

            raise ValidationError("Record for: {} with name: {} already exists.".format(
                self.person, self.name))

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "endpoint_name": self.endpoint_name,
            "endpoint_uri": self.endpoint_uri
        }


### ATTACHMENT

IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.gif', '.png']


def upload_to(instance, filename):
    name, extension = os.path.splitext(filename)

    if extension in IMAGE_EXTENSIONS:
        return '/'.join([settings.IMAGE_FULL_SUB_PATH, filename])
    else:
        return '/'.join([settings.FILES_SUB_PATH, filename])


def upload_to_images_medium(instance, filename):
    return '/'.join([settings.IMAGE_MEDIUM_SUB_PATH, filename])


def upload_to_images_thumbnail(instance, filename):
    return '/'.join([settings.IMAGE_THUMBNAIL_SUB_PATH, filename])


class AttachmentQuerySet(BaseQuerySet):

    def to_dict_full(self):
        return [x.to_dict_full() for x in self.all()]


class AttachmentManager(BaseManager):

    queryset_cls = AttachmentQuerySet

    def to_dict_full(self):
        return self.get_queryset().to_dict_full()


class Attachment(BaseModel):
    """
    Stores a File or Image w/ multiple sizes locations in a single model.

    Will reject uploads that exceed the ``settings.MAX_UPLOAD_SIZE``

    Populate ``filename`` and ``is_image`` upon upload.

    `MIME Types reference <http://www.sitepoint.com/web-foundations/mime-types-complete-list/>`_
    """
    # GenericForeignKey
    content_type = models.ForeignKey(ContentType, null=True)
    object_id = models.UUIDField(null=True)
    content_object = MyGenericForeignKey('content_type', 'object_id')
    # Fields
    filename = models.CharField(max_length=100, blank=True)
    is_image = models.BooleanField(blank=True, default=False)
    file = models.FileField(upload_to=upload_to, null=True, blank=True)
    image_full = models.ImageField(upload_to=upload_to, null=True, blank=True)
    image_medium = models.ImageField(upload_to=upload_to_images_medium, null=True, blank=True)
    image_thumbnail = models.ImageField(upload_to=upload_to_images_thumbnail, null=True, blank=True)

    objects = AttachmentManager()

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
            self.is_image = True
            self.image_full = self.file

            self.image_medium.name = "/".join([settings.IMAGE_MEDIUM_SUB_PATH, self.filename])
            self.save_alt_image(location=self.image_medium.name, size=(250, 250))

            self.image_thumbnail.name = "/".join([settings.IMAGE_THUMBNAIL_SUB_PATH, self.filename])
            self.save_alt_image(location=self.image_thumbnail.name, size=(50, 50))

        super(Attachment, self).save(*args, **kwargs)

    def delete(self, override=None, *args, **kwargs):
        """Remove file from file system."""
        super(Attachment, self).delete(override, *args, **kwargs)
        if override:
            # Pass false so FileField doesn't save the model.
            self.file.delete(False)

    def save_alt_image(self, location, size):
        try:
            with Image.open(self.image_full) as im:
                im = im.resize(size, Image.ANTIALIAS)

                tail, head = os.path.split(os.path.join(settings.MEDIA_ROOT, location))
                if not os.path.exists(tail):
                    os.makedirs(tail)

                im.save(os.path.join(tail, head))
        except OSError:
            # ``SimpleUploadedFile`` in test will raise this error b/c ``self.file``
            # is not an actual file object.
            pass

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
            if self.file.size > settings.MAX_UPLOAD_SIZE:
                raise DjangoValidationError("File size: {} to big".format(
                    self.file._file._size))
        except AttributeError:
            pass

    def to_dict(self):
        return {
            "id": str(self.id),
            "filename": self.filename,
            "file": media_path(self.file),
            "image_thumbnail": media_path(self.image_thumbnail)
        }

    def to_dict_full(self):
        return {
            "id": str(self.id),
            "filename": self.filename,
            "file": media_path(self.file),
            "image_full": media_path(self.image_full),
            "image_medium": media_path(self.image_medium),
            "image_thumbnail": media_path(self.image_thumbnail)
        }
