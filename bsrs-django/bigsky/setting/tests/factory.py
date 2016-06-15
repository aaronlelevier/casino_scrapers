import copy

from setting.models import Setting, SETTING_TITLE_GENERAL
from setting.settings import GENERAL_SETTINGS, ROLE_SETTINGS, PERSON_SETTINGS
from utils.helpers import generate_uuid


def create_general_setting(name='general'):
    remove_prior_settings(name=name)
    settings_dict = copy.copy(GENERAL_SETTINGS)
    id = generate_uuid(Setting)
    return Setting.objects.create(id=id, name=name, title=SETTING_TITLE_GENERAL, settings=settings_dict)


def create_role_setting(instance, name='role'):
    return create_with_settings(instance, name, ROLE_SETTINGS)


def create_person_setting(instance, name='person'):
    return create_with_settings(instance, name, PERSON_SETTINGS)


def remove_prior_settings(**kwargs):
    try:
        s = Setting.objects.get(**kwargs)
    except Setting.DoesNotExist:
        pass
    else:
        s.delete(override=True)


def create_with_settings(instance, name, init_settings):
    remove_prior_settings(name=name, related_id=instance.id)

    title = 'admin.setting.name.'+name
    settings_dict = copy.copy(init_settings)
    settings = Setting.objects.create(name=name, title=title, related_id=instance.id,
                                      settings=settings_dict)
    instance.settings = settings
    instance.save()
    return settings
