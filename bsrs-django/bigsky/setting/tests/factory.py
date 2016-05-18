import copy

from setting.models import Setting
from setting.settings import GENERAL_SETTINGS, ROLE_SETTINGS


def create_general_setting():
    return Setting.objects.create(name='general', settings=GENERAL_SETTINGS)


def create_role_setting(role):
    settings = Setting.objects.create(settings=ROLE_SETTINGS)
    role.settings = settings
    role.save()
    return settings