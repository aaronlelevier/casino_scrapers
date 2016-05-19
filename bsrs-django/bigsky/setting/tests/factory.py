import copy

from setting.models import Setting
from setting.settings import GENERAL_SETTINGS, ROLE_SETTINGS, PERSON_SETTINGS


def create_general_setting():
    try:
        s = Setting.objects.get(name='general')
    except Setting.DoesNotExist:
        pass
    else:
        s.delete(override=True)

    settings_dict = copy.copy(GENERAL_SETTINGS)
    return Setting.objects.create(name='general', settings=settings_dict)


def create_role_setting(instance):
    return create_with_settings(instance, ROLE_SETTINGS)


def create_person_setting(instance):
    return create_with_settings(instance, PERSON_SETTINGS)


def create_with_settings(instance, init_settings):
    settings_dict = copy.copy(init_settings)
    settings = Setting.objects.create(settings=settings_dict)
    instance.settings = settings
    instance.save()
    return settings