import copy

from setting.models import Setting
from setting.settings import GENERAL_SETTINGS, ROLE_SETTINGS, PERSON_SETTINGS


def create_general_setting():
    try:
        return Setting.objects.get(name='general')
    except Setting.DoesNotExist:
        return Setting.objects.create(name='general', settings=GENERAL_SETTINGS)


def create_role_setting(instance):
    settings_dict = copy.copy(ROLE_SETTINGS)
    settings = Setting.objects.create(settings=settings_dict)
    instance.settings = settings
    instance.save()
    return settings


def create_person_setting(instance):
    settings_dict = copy.copy(PERSON_SETTINGS)
    settings = Setting.objects.create(settings=settings_dict)
    instance.settings = settings
    instance.save()
    return settings