"""
All Model, Manager, and QuerySet definitions in this module 
should be Abstract.
"""
import copy
import uuid

from django.core.exceptions import ObjectDoesNotExist
from django.db import models
from django.utils import timezone

from generic.settings import DEFAULT_GENERAL_SETTINGS
from person.settings import DEFAULT_ROLE_SETTINGS


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
        help_text="If NULL the record is not deleted, otherwise this is the \
timestamp of when the record was deleted.")

    objects = BaseManager()
    objects_all = models.Manager()

    class Meta:
        abstract = True

    def __str__(self):
        return "id: {self.id}; class: {self.__class__.__name__}; deleted: \
{self.deleted}".format(self=self)

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
    

class BaseNameModel(BaseModel):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        abstract = True

    def __str__(self):
        return self.name

    def to_dict(self):
        return {"id": str(self.pk), "name": self.name}


class BaseNameOrderModel(BaseNameModel):
    order = models.IntegerField(blank=True, default=0)

    class Meta:
        abstract = True


class BaseStatusQuerySet(models.query.QuerySet):

    def default(self):
        try:
            return self.get(default=True)
        except ObjectDoesNotExist:
            return
    
    def update_non_defaults(self, id):
        self.exclude(id=id).update(default=False)


class BaseStatusManager(BaseManager):

    def get_queryset(self):
        return BaseStatusQuerySet(self.model, using=self._db).filter(deleted__isnull=True)

    def default(self):
        return self.get_queryset().default()

    def update_non_defaults(self, id):
        self.get_queryset().update_non_defaults(id)


class BaseStatusModel(BaseNameModel):
    """
    To be used with all leaf node `Status` models, and provide a 
    unique name with a single default record.
    """
    default = models.BooleanField(blank=True, default=False)

    objects = BaseStatusManager()

    class Meta:
        ordering = ('name',)
        abstract = True

    @property
    def _status_model(self):
        """
        If a Model has this `property` and it is set to `True`, then it will 
        be loaded into the `Boostrap` data under a single Array of Statuses.
        """
        return True


class SettingMixin(object):
    """
    Settings interface mixin for models with 'settings' JSONField's.
    """
    @classmethod
    def get_class_default_settings(cls, name=None):
        name = name or cls.__name__.lower()

        if name == 'general':
            return DEFAULT_GENERAL_SETTINGS
        elif name == 'role':
            return DEFAULT_ROLE_SETTINGS
        else:
            return {}

    @classmethod
    def get_class_combined_settings(cls, base_name, *settings):
        """
        :base_name: the 'str' name of the base `Settings` dict.
        :settings: the other settings files to override the base in order of precedence.
        """
        base = cls.get_class_default_settings(base_name)
        combined = copy.copy(base)

        for setting in settings:
            for k,v in combined.items():
                try:
                    setting[k]
                except KeyError:
                    combined[k]['inherited'] = True
                    combined[k]['inherited_value'] = combined[k]['value']
                    combined[k]['value'] = None

            combined.update(setting)

        return combined

    @classmethod
    def get_all_class_settings(cls):
        raise NotImplementedError("Must implent 'get_all_class_settings' on the concrete \
class because these are specific to the class.")

    def get_all_instance_settings(self):
        raise NotImplementedError("Must implent 'get_all_instance_settings', so the \
model instance has access to all if it's inherited and concrete settings.")
