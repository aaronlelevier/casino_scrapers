import random

from model_mommy import mommy

from contact.models import (PhoneNumber, PhoneNumberType, PHONE_NUMBER_TYPES,
    Address, Email)
from utils.helpers import generate_uuid


PHONE_NUMBER_BASE_ID = "21f530c4-ce6c-4724-9cfd-37a16e787"
ADDRESS_BASE_ID = "22f530c4-ce6c-4724-9cfd-37a16e787"
EMAIL_BASE_ID = "23f530c4-ce6c-4724-9cfd-37a16e787"


def create_contact(model, content_object):
    """
    `object_id` is a UUID, which `model_mommy` doesn't know how to make,
    so it must be specified.

    :model: ``contact`` app model class
    :content_object: object to create foreign key for. i.e. ``person`` instance
    """
    create_method = get_create_contact_method(model)
    return create_method(content_object)


def create_contacts(content_object):
    """
    :content_object: object to create foreign key for. i.e. ``person`` instance
    """
    for model in [PhoneNumber, Address, Email]:
        create_method = get_create_contact_method(model)
        create_method(content_object)


def get_create_contact_method(model):
    if model == PhoneNumber:
        return load_create_contact(model, PHONE_NUMBER_BASE_ID)
    elif model == Address:
        return load_create_contact(model, ADDRESS_BASE_ID)
    elif model == Email:
        return load_create_contact(model, EMAIL_BASE_ID)


def load_create_contact(model, uuid):
    def create_contact_instance(instance):
        incr = model.objects.count()
        id = generate_uuid(uuid, incr)
        return mommy.make(model, id=id, content_object=instance,
                          object_id=instance.id, _fill_optional=['type'])
    return create_contact_instance


def create_phone_number_type(name=None):
    name = name or random.choice(PHONE_NUMBER_TYPES)
    obj, _ = PhoneNumberType.objects.get_or_create(name=name)
    return obj


def create_phone_number_types():
    for name in PHONE_NUMBER_TYPES:
        create_phone_number_type(name=name)
    return PhoneNumberType.objects.all()
