import random

from model_mommy import mommy

from contact.models import (PhoneNumber, PhoneNumberType, Email, EmailType,
    Address, AddressType, PHONE_NUMBER_TYPES, EMAIL_TYPES, ADDRESS_TYPES)
from utils.helpers import generate_uuid


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
        return load_create_contact(model)
    elif model == Address:
        return load_create_contact(model)
    elif model == Email:
        return load_create_contact(model)


def load_create_contact(model):
    def create_contact_instance(instance):
        incr = model.objects.count()
        id = generate_uuid(model)
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


def create_email_type(name=None):
    name = name or random.choice(EMAIL_TYPES)
    obj, _ = EmailType.objects.get_or_create(name=name)
    return obj


def create_email_types():
    for name in EMAIL_TYPES:
        create_email_type(name=name)
    return EmailType.objects.all()


def create_address_type(name=None):
    name = name or random.choice(ADDRESS_TYPES)
    obj, _ = AddressType.objects.get_or_create(name=name)
    return obj


def create_address_types():
    for name in ADDRESS_TYPES:
        create_address_type(name=name)
    return AddressType.objects.all()


def create_contact_types():
    create_phone_number_types()
    create_email_types()
    create_address_types()
