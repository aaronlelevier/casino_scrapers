import copy

from setting.models import Setting
from setting.settings import DEFAULT_GENERAL_SETTINGS


def create_general_setting():
    settings = copy.copy(DEFAULT_GENERAL_SETTINGS)
    return Setting.objects.create(name='general', settings=settings)
