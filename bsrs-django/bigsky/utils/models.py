"""
All Model, Manager, and QuerySet definitions in this module 
should be Abstract.
"""
import copy
import uuid

from django.db import models
from django.utils import timezone

from setting.settings import GENERAL_SETTINGS, ROLE_SETTINGS


########
# BASE #
########
'''
Base Model, Manager, and QuerySet for which all Models will inherit 
from. This will enforce not deleting, but just hiding records.
'''

from json import JSONEncoder

JSONEncoder_olddefault = JSONEncoder.default

def JSONEncoder_newdefault(self, o):
    if isinstance(o, uuid.UUID): return str(o)
    return JSONEncoder_olddefault(self, o)

JSONEncoder.default = JSONEncoder_newdefault


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


class SettingMixin(object):
    """
    Settings interface mixin for models with 'settings' JSONField's.
    """
    def get_class_default_settings(self, name=None):
        name = name or type(self).__name__.lower()

        if name == 'general':
            return copy.copy(GENERAL_SETTINGS)
        elif name == 'role':
            return copy.copy(ROLE_SETTINGS)
        else:
            return {}

    def get_class_combined_settings_full(self, base_name, *settings):
        """ concat/update all dicts """
        ret = self.get_class_default_settings(base_name)
        for setting in settings:
            ret.update(setting)
        return ret

    def get_class_combined_settings(self, base_name, *settings):
        """
        :base_name: the 'str' name of the base `Settings` dict.
        :settings: the other settings files to override the base in order of precedence.
        """
        base = self.get_class_default_settings(base_name)
        combined = {}
        combined.update(base)

        all_overrides = self.combine_overrides(settings)
        combined = self.update_overrides(combined, all_overrides)
        combined = self.update_non_overrides(combined, all_overrides)

        return combined

    def combine_overrides(self, settings):
        all_overrides = {}
        for setting in settings:
            all_overrides.update(setting)
        return all_overrides

    def update_overrides(self, init, override):
        init_copy = copy.copy(init)
        ret = {}
        ret.update(init_copy)

        for k,v in override.items():
            # override
            if k in init:
                ret[k]['inherited_value'] = init[k]['value']
                ret[k]['value'] = override[k]['value']
                ret[k]['inherited_from'] = init[k]['inherited_from']
            # append
            else:
                ret[k] = {}
                ret[k]['inherited_value'] = None
                ret[k]['value'] = override[k]['value']
                ret[k]['inherited_from'] = override[k]['inherited_from']

        return ret

    def update_non_overrides(self, init, override):
        init = copy.copy(init)

        for k,v in init.items():
            if k not in override:
                init[k]['inherited_value'] = init[k]['value']
                init[k]['value'] = None

        return init

    @classmethod
    def get_settings_name(cls):
        raise NotImplementedError("Must implent 'get_settings_name' on the concrete class")

    def get_all_class_settings(self):
        raise NotImplementedError("""Must implent 'get_all_class_settings' on the concrete \
class because these are specific to the class.""")

    def get_all_instance_settings(self):
        raise NotImplementedError("""Must implent 'get_all_instance_settings', so the \
model instance has access to all if it's inherited and concrete settings.""")
