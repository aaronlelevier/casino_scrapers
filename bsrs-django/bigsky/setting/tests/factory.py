import copy

from setting.models import Setting
from setting.settings import GENERAL_SETTINGS, ROLE_SETTINGS, PERSON_SETTINGS


def create_general_setting():
    try:
        return Setting.objects.get(name='general')
    except Setting.DoesNotExist:
        return Setting.objects.create(name='general', settings=GENERAL_SETTINGS)


def create_role_setting(instance):
    settings = Setting.objects.create(settings=ROLE_SETTINGS)
    instance.settings = settings
    instance.save()
    return settings


def create_person_setting(instance):
    settings = Setting.objects.create(settings=PERSON_SETTINGS)
    instance.settings = settings
    instance.save()
    return settings