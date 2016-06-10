import copy

from django.contrib.auth.models import ContentType
from django.contrib.postgres.fields import JSONField
from django.db import models

from setting.mixins import SettingMixin
from utils.models import BaseModel, ToDictNameMixin


SETTING_TITLE_GENERAL = 'admin.setting.name.general'
SETTING_TITLE_PERSON = 'admin.setting.name.person'
SETTING_TITLE_ROLE = 'admin.setting.name.role'


class Setting(ToDictNameMixin, SettingMixin, BaseModel):
    '''
    ``Setting`` records will be either Standard or Custom. and be set
    at levels. ex - General > Role > Person.

    For Person who inherits Settings from a particular Role, use
    ``related_id`` as the Role's ID in combination with name='role'
    '''
    title = models.CharField(max_length=100, null=True,
        help_text="i18n key used on front end. General settings uses this, others may as well.")
    name = models.CharField(max_length=100, null=True)
    related_id = models.UUIDField(null=True)
    settings = JSONField(blank=True, default={})

    class Meta:
        unique_together = ('name', 'related_id')

    def combined_settings(self):
        """
        This should always be called on the person `instance`, role `instance`,
        etc... because may have inherited field values. Not called on the
        related settings model instance.

        Returns it's settings plus all inherited settings.
        """
        self.inherits_from_map = self.get_inherits_from_map()
        return self.inherited_settings()

    def get_inherits_from_names(self):
        return {v['inherits_from'] for k,v in self.settings.items()
                                   if 'inherits_from' in v}

    def get_inherits_from_map(self):
        """
        Returns a dict where:
          - key: is 'inherits from name',
          - value: is a tuple => (<inherits_from_id>, <inherits_from_settings>)
        """
        names = self.get_inherits_from_names()
        ret = {}
        for s in Setting.objects.filter(name__in=names):
            if s.name == 'general':
                ret[s.name] = (str(s.id), s.settings)
            elif s.name == 'role' and s.related_id == self.person.role.id:
                role = self.get_role_settings(s.related_id)
                ret[s.name] = (str(role.id), role.settings.settings)
        return ret

    @staticmethod
    def get_role_settings(role_id):
        role_type = ContentType.objects.get(app_label='person', model='role')
        return role_type.get_object_for_this_type(id=role_id)

    def inherited_settings(self):
        settings = copy.copy(self.settings)

        for k,v in settings.items():
            if not isinstance(v, dict):
                raise TypeError("'{}' is not a dict".format(v))

            if 'inherits_from' in v:
                inherits_from = v['inherits_from']
                (inherits_from_id, inherited_setting_objs) = self.inherits_from_map[inherits_from]
                inherited_setting_obj = inherited_setting_objs[k]
                settings[k].update({
                    'value': None if 'value' not in v else v['value'],
                    # 'inherits_from' already exists in 'role' setting
                    'inherits_from_id': inherits_from_id,
                    'inherited_value': inherited_setting_obj['value']
                    })
        return settings
