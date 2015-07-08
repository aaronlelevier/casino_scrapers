from django.db import models
from django.utils.encoding import python_2_unicode_compatible
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey


@python_2_unicode_compatible
class AbstractNameOrder(models.Model):
    order = models.IntegerField()
    name = models.CharField(max_length=100)
    
    class Meta:
        abstract = True
        ordering = ('order', 'name',)

    def __str__(self):
        return self.name


@python_2_unicode_compatible
class AbstractName(models.Model):
    name = models.CharField(max_length=100)

    class Meta:
        abstract = True

    def __str__(self):
        return self.name


@python_2_unicode_compatible
class Setting(models.Model):
    '''
    ``Setting`` records will be either Standard or Custom. and be set 
    at levels. ex - Location, Role, User.
    '''
    custom = models.BooleanField(blank=True, default=True)
    settings = models.TextField(help_text="JSON Dict saved as a string in DB")

    # Generic ForeignKey Settings, so ``Setting`` can be set 
    # for any Django Model
    content_type = models.ForeignKey(ContentType)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    def __str__(self):
        return self.settings
