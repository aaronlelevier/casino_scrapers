import copy

from setting.models import Setting
from setting.settings import GENERAL_SETTINGS, ROLE_SETTINGS, PERSON_SETTINGS


def create_general_setting():
    name = 'general'
    remove_prior_settings(name=name)
    settings_dict = copy.copy(GENERAL_SETTINGS)
    return Setting.objects.create(name=name, settings=settings_dict)


def create_role_setting(instance):
    name = 'role'
    remove_prior_settings(name=name, related_id=instance.id)
    return create_with_settings(instance, name, ROLE_SETTINGS)


def create_person_setting(instance):
    name = 'person'
    remove_prior_settings(name=name, related_id=instance.id)
    return create_with_settings(instance, name, PERSON_SETTINGS)


def remove_prior_settings(**kwargs):
    try:
        s = Setting.objects.get(**kwargs)
    except Setting.DoesNotExist:
        pass
    else:
        s.delete(override=True)


def create_with_settings(instance, name, init_settings):
    settings_dict = copy.copy(init_settings)
    settings = Setting.objects.create(name=name, related_id=instance.id,
                                      settings=settings_dict)
    instance.settings = settings
    instance.save()
    return settings
