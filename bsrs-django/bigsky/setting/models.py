import copy

from django.contrib.postgres.fields import JSONField
from django.core.exceptions import ValidationError
from django.db import models

from utils.models import BaseModel


class Setting(BaseModel):
    '''
    ``Setting`` records will be either Standard or Custom. and be set
    at levels. ex - General > Role > Person.
    '''
    name = models.CharField(max_length=100, unique=True, null=True)
    settings = JSONField(blank=True, default={})

    def combined_settings(self):
        """
        Retuns it's settings plus all inherited settings.
        """
        self.inherits_from_map = self.get_inherits_from_map()
        _settings = copy.copy(self.settings)
        return self.inherited_settings(_settings)

    def get_inherits_from_names(self):
        return {v['inherits_from'] for k,v in self.settings.items()
                                   if 'inherits_from' in v}

    def get_inherits_from_map(self):
        names = self.get_inherits_from_names()
        return {s['name']: s['settings']
                for s in (Setting.objects.filter(name__in=names)
                                         .values('name', 'settings'))}

    def inherited_settings(self, settings):
        for k,v in settings.items():
            if not isinstance(v, dict):
                raise TypeError("'{}' is not a dict".format(v))

            if 'value' not in v:
                inherits_from = v['inherits_from']
                inherited_setting_objs = self.inherits_from_map[inherits_from]
                inherited_setting_obj = inherited_setting_objs[k]
                settings[k].update({
                    'value': None,
                    'type': inherited_setting_obj['type'],
                    # 'inherited_from' already exists in 'role' setting
                    'inherited_value': inherited_setting_obj['value']
                    })
        return settings