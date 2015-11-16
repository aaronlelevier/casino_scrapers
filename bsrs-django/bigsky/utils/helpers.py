import json

from translation.models import Locale


def model_to_json(model):
    return json.dumps([m.to_dict() for m in model.objects.all()])


def choices_to_json(model):
    return json.dumps([m[0] for m in model])


def current_locale(user):
    if user.locale:
        locale = user.locale
    else:
        locale = Locale.objects.system_default()
    return json.dumps(locale.to_dict())


def generate_uuid(base_id, incr=0):
    return "{}{:03d}".format(base_id, incr)
