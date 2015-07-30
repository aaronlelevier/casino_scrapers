import uuid

from django.db import models
from django.utils import timezone
from django.utils.encoding import python_2_unicode_compatible
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey


########
# BASE #
########
'''
Base Model, Manager, and QuerySet for which all Models will inherit 
from. This will enforce not deleting, but just hiding records.
'''
class BaseQuerySet(models.query.QuerySet):
    pass


class BaseManager(models.Manager):
    '''
    Auto exclude deleted records
    '''
    def get_queryset(self):
        return BaseQuerySet(self.model, using=self._db).filter(deleted__isnull=True)


@python_2_unicode_compatible
class BaseModel(models.Model):
    '''
    All Model inheritance will start with this model.  It uses 
    time stamps, and defaults for `deleted=False` for querysets
    '''
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    deleted = models.DateTimeField(blank=True, null=True,
        help_text="If NULL the record is not deleted, otherwise this is the \
timestamp of when the record was deleted.")

    objects = BaseManager()
    objects_all = models.Manager()

    class Meta:
        abstract = True

    def __str__(self):
        return "id: {self.id}; class: {self.__class__.__name__}; deleted: \
{self.deleted}".format(self=self)

    def delete(self, override=False, *args, **kwargs):
        '''
        Enforce only hiding objects and not deleting them unless explicitly 
        overriden.
        '''
        if not override:
            self.deleted = timezone.now()
            self.save()
        else:
            super(BaseModel, self).delete(*args, **kwargs)
            
    def to_dict(self):
        return {"id": str(self.pk), "name": self.name}


class Tester(BaseModel):
    pass
    

@python_2_unicode_compatible
class AbstractName(BaseModel):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        abstract = True

    def __str__(self):
        return self.name


@python_2_unicode_compatible
class AbstractNameOrder(BaseModel):
    order = models.IntegerField(blank=True, default=0)
    name = models.CharField(max_length=100, unique=True)
    
    class Meta:
        abstract = True
        ordering = ('order', 'name',)

    def __str__(self):
        return self.name


@python_2_unicode_compatible
class BaseSetting(BaseModel):
    '''
    ``Setting`` records will be either Standard or Custom. and be set 
    at levels. ex - Location, Role, User.
    '''
    settings = models.TextField(blank=True, help_text="JSON Dict saved as a string in DB")

    # Generic ForeignKey Settings, so ``Setting`` can be set 
    # for any Django Model
    content_type = models.ForeignKey(ContentType)
    object_id = models.UUIDField()
    content_object = GenericForeignKey('content_type', 'object_id')

    class Meta:
        abstract = True

    def __str__(self):
        return self.settings


class MainSetting(BaseSetting):
    pass


class CustomSetting(BaseSetting):
    pass
