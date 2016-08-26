"""
All Model, Manager, and QuerySet definitions in this module 
should be Abstract.
"""
import copy
import decimal
import uuid

from django.db import models
from django.utils import timezone

from utils import classproperty
from utils.exceptions import QuerySetClassNotDefined



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

    def filter_export_data(self, query_params):
        """
        NOTE: search supporting 'in', and case insensitive ordering won't
        currently work with this method. If these features are needed,
        then this will need to be extended.
        """
        query_dict = copy.copy({k:v for k,v in query_params.items()})

        search = query_dict.pop('search', None)
        ordering = query_dict.pop('ordering', None)
        params = {k:v for k,v in query_dict.items()
                      if k in self.model.export_fields}

        qs = self.filter(**params).values(*self.model.export_fields)
        if search:
            qs = qs.search_multi(search)
        if ordering:
            qs = qs.order_by(*ordering)

        return qs


class BaseManagerMixin(object):

    def filter_export_data(self, query_params):
        return self.get_queryset().filter_export_data(query_params)


class BaseManager(BaseManagerMixin, models.Manager):
    '''
    Auto exclude deleted records

    :queryset_cls:
      Must defined on the class that sub-classes this manager. This is how
      the `get_queryset` method knows which QuerySet class to use.
    '''
    queryset_cls = BaseQuerySet

    def get_queryset(self):
        if not getattr(self.__class__, "queryset_cls"):
            raise QuerySetClassNotDefined("Must define 'queryset_cls' for use with this Manager.")

        return self.__class__.queryset_cls(self.model, using=self._db).filter(deleted__isnull=True)


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

    @classproperty
    def export_fields(cls):
        try:
            return cls.EXPORT_FIELDS
        except AttributeError:
            return [x.name for x in cls._meta.get_fields()]


class TesterQuerySet(BaseQuerySet):
    pass

class TesterManager(BaseManager):
    queryset_cls = TesterQuerySet

class Tester(BaseModel):
    objects = TesterManager()
    

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
        obj, _ = self.get_or_create(name=self.model.default)
        return obj
