"""
All Model, Manager, and QuerySet definitions in this module 
should be Abstract.
"""
import decimal
import uuid

from django.db import models
from django.utils import timezone


"""
Monkey patch the JSONEncoder to cast UUID's as strings.
This is needed for ``Ticket.dt_path`` JsonField to populate
using ``ticket_serializer_instance.data``
"""
from json import JSONEncoder

JSONEncoder_olddefault = JSONEncoder.default

def JSONEncoder_newdefault(self, o):
    if isinstance(o, uuid.UUID): return str(o)
    if isinstance(o, decimal.Decimal): return float(o)
    return JSONEncoder_olddefault(self, o)

JSONEncoder.default = JSONEncoder_newdefault


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


class BaseModel(models.Model):
    '''
    All Model inheritance will start with this model.  It uses 
    time stamps, and defaults for `deleted=False` for querysets
    '''
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    deleted = models.DateTimeField(blank=True, null=True,
        help_text="""If NULL the record is not deleted, otherwise this is the \
timestamp of when the record was deleted.""")

    objects = BaseManager()
    objects_all = models.Manager()

    class Meta:
        abstract = True

    def __str__(self):
        return """id: {self.id}; class: {self.__class__.__name__}; deleted: \
{self.deleted}""".format(self=self)

    def delete(self, override=None, *args, **kwargs):
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
        return {"id": str(self.pk)}


class Tester(BaseModel):
    pass
    

class ToDictNameMixin(object):
    def to_dict(self):
        return {"id": str(self.pk), "name": self.name}


class BaseNameModel(ToDictNameMixin, BaseModel):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        abstract = True

    def __str__(self):
        return self.name


class BaseNameOrderModel(BaseNameModel):
    order = models.IntegerField(blank=True, default=0)

    class Meta:
        abstract = True


class DefaultToDictMixin(object):

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "default": True if self.name == self.default else False
        }


class DefaultNameManager(BaseManager):

    def default(self):
        return self.get(name=self.model.default)
