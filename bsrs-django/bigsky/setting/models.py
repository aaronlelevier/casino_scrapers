import copy

from django.contrib.auth.models import ContentType
from django.contrib.postgres.fields import JSONField
from django.db import models

from utils.models import BaseModel, ToDictNameMixin


class Setting(ToDictNameMixin, BaseModel):
    '''
    ``Setting`` records will be either Standard or Custom. and be set
    at levels. ex - General > Role > Person.

    For Person who inherits Settings from a particular Role, use
    ``related_id`` as the Role's ID in combination with name='role'
    '''
    name = models.CharField(max_length=100, null=True)
    related_id = models.UUIDField(null=True)
    settings = JSONField(blank=True, default={})

    class Meta:
        unique_together = ('name', 'related_id')

    def combined_settings(self):
        """
        Returns it's settings plus all inherited settings.
        """
        self.inherits_from_map = self.get_inherits_from_map()
        return self.inherited_settings()

    def get_inherits_from_names(self):
        return {v['inherits_from'] for k,v in self.settings.items()
                                   if 'inherits_from' in v}

    def get_inherits_from_map(self):
        names = self.get_inherits_from_names()
        ret = {}
        for s in Setting.objects.filter(name__in=names):
            if s.name == 'general':
                ret[s.name] = s.settings
            elif s.name == 'role' and s.related_id == self.person.role.id:
                ret[s.name] = self.get_role_settings(s.related_id)
        return ret

    @staticmethod
    def get_role_settings(role_id):
        role_type = ContentType.objects.get(app_label='person', model='role')
        role = role_type.get_object_for_this_type(id=role_id)
        return role.settings.settings

    def inherited_settings(self):
        settings = copy.copy(self.settings)

        for k,v in settings.items():
            if not isinstance(v, dict):
                raise TypeError("'{}' is not a dict".format(v))

            if 'value' not in v or 'inherits_from' in v:
                inherits_from = v['inherits_from']
                inherited_setting_objs = self.inherits_from_map[inherits_from]
                inherited_setting_obj = inherited_setting_objs[k]
                settings[k].update({
                    'value': None,
                    'type': inherited_setting_obj['type'],
                    # 'inherits_from' already exists in 'role' setting
                    'inherited_value': inherited_setting_obj['value']
                    })
        return settings
