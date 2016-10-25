import datetime
import json
import pytz
import uuid

from django.conf import settings
from django.contrib.auth.models import ContentType
from django.db import models
from django.forms.models import model_to_dict as django_model_to_dict


BASE_UUID = "530c4-ce6c-4724-9cfd-37a16e787"


def model_to_json(model):
    return json.dumps([m.to_dict() for m in model.objects.all()])


def model_to_json_select_related(model, *args):
    return json.dumps([m.to_dict() for m in model.objects.all().select_related(*args)])


def model_to_json_prefetch_related(model, *args):
    return json.dumps([m.to_dict() for m in model.objects.all().prefetch_related(*args)])


def model_to_dict(instance):
    """
    Because as of Django 1.10 `model_to_dict` returns a QuerySet for
    m2m related models.
    """
    d = django_model_to_dict(instance)
    for k,v in d.items():
        if isinstance(v, models.query.QuerySet):
            d[k] = [x for x in v.values_list('id', flat=True)]
    return d


def queryset_to_json(queryset):
    return json.dumps([m.to_dict() for m in queryset.all()])


def get_content_type_number(model):
    model_name = model.__name__.lower()
    content_type = ContentType.objects.get(model=model_name)
    return "{:03d}".format(content_type.id)


def generate_uuid(model):
    """
    Used to create predictable sychronous UUIDs for generating fixtures.

    :model: the model class. i.e. TicketPriority
    """
    model_number = get_content_type_number(model)
    number = "{:03d}".format(model.objects.count()+1)
    return uuid.UUID("{model_number}{base_id}{number}".format(model_number=model_number,
                                                              base_id=BASE_UUID,
                                                              number=number))


def media_path(path, prefix=settings.MEDIA_URL):
    if not path:
        return ""
    return "{}{}".format(prefix, path)


def create_default(klass):
    obj, created = klass.objects.get_or_create(name=klass.default)
    return obj


def local_strftime(d, tzname=settings.TIME_ZONE):
    """ :d: datetime instance """
    tzinfo = pytz.timezone(tzname)
    dt = datetime.datetime(d.year, d.month, d.day, d.hour, d.minute,
                           d.second, tzinfo=tzinfo)
    return datetime.datetime.strftime(tzinfo.normalize(dt + dt.utcoffset()),
                                      "%Y-%m-%d %H:%M:%S")


# relate model crud methods (add, remove, clear)

def add_related(model, related_model_str, related_model):
    setattr(model, related_model_str, related_model)
    model.save()


def remove_related(related_model):
    related_model.delete()


def clear_related(model, related_name):
    getattr(model, related_name).all().delete()

# related model crud: end


def get_model_class(model):
    """
    Can use this method to import a model class.

    :param model:
        string name of the model as all one word
        i.e. TicketStatus would be: "ticketstatus"
    """
    return ContentType.objects.get(model=model).model_class()


class KwargsAsObject(object):

    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)


def get_person_and_role_ids(data):
    """
    Separates Person and Role ids into two lists based on type.

    :param data:
        List of dict's with id,type keys for recipients. Either
        being of type 'person' or 'role'
    """
    person_ids = []
    role_ids = []

    for x in data['recipients']:
        if x['type'] == 'person':
            person_ids.append(x['id'])
        elif x['type'] == 'role':
            role_ids.append(x['id'])

    return person_ids, role_ids
