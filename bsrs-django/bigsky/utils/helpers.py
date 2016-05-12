import json
import uuid

from django.conf import settings
from django.contrib.auth.models import ContentType


BASE_UUID = "530c4-ce6c-4724-9cfd-37a16e787"


def model_to_json(model):
    return json.dumps([m.to_dict() for m in model.objects.all()])


def model_to_json_select_related(model, *args):
    return json.dumps([m.to_dict() for m in model.objects.all().select_related(*args)])


def model_to_json_prefetch_related(model, *args):
    return json.dumps([m.to_dict() for m in model.objects.all().prefetch_related(*args)])


def get_content_type_number(model):
    model_name = model.__name__.lower()
    content_type = ContentType.objects.get(model=model_name)
    return "{:03d}".format(content_type.id)


def generate_uuid(model):
    model_number = get_content_type_number(model)
    number = "{:03d}".format(model.objects.count()+1)
    return uuid.UUID("{model_number}{base_id}{number}".format(model_number=model_number,
                                                              base_id=BASE_UUID,
                                                              number=number))


def media_path(path, prefix=settings.MEDIA_URL):
    if not path:
        return ""
    return "{}{}".format(prefix, path)
