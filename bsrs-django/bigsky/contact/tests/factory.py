import random

from model_mommy import mommy

from contact.models import (
    State, Country, PhoneNumber, PhoneNumberType, Email, EmailType,
    Address, AddressType)
from utils.helpers import generate_uuid


STATE_CODE = "CA"
STATE_CODE_TWO = "NV"
COUNTRY_COMMON_NAME = "United States"


def create_contact(model, content_object, type=None):
    """
    `object_id` is a UUID, which `model_mommy` doesn't know how to make,
    so it must be specified.

    :model: ``contact`` app model class. i.e. ``Email``
    :content_object: object to create foreign key for. i.e. ``person`` instance
    """
    create_method = load_create_contact(model)
    instance = create_method(content_object)
    if type:
        instance.type = type
        instance.save()
    return instance


def create_contacts(content_object):
    """
    :content_object: object to create foreign key for. i.e. ``person`` instance
    """
    for model in [PhoneNumber, Address, Email]:
        create_method = load_create_contact(model)
        create_method(content_object)


def load_create_contact(model):
    def create_contact_instance(instance):
        incr = model.objects.count()
        id = generate_uuid(model)
        return mommy.make(model, id=id, content_object=instance,
                          object_id=instance.id, _fill_optional=['type'])
    return create_contact_instance


def create_phone_number_type(name=None):
    name = name or random.choice(PhoneNumberType.ALL)
    obj, _ = PhoneNumberType.objects.get_or_create(name=name)
    return obj


def create_phone_number_types():
    for name in PhoneNumberType.ALL:
        create_phone_number_type(name=name)
    return PhoneNumberType.objects.all()


def create_email_type(name=None):
    name = name or random.choice(EmailType.ALL)
    obj, _ = EmailType.objects.get_or_create(name=name)
    return obj


def create_email_types():
    for name in EmailType.ALL:
        create_email_type(name=name)
    return EmailType.objects.all()


def create_address_type(name=None):
    name = name or random.choice(AddressType.ALL)
    obj, _ = AddressType.objects.get_or_create(name=name)
    return obj


def create_address_types():
    for name in AddressType.ALL:
        create_address_type(name=name)
    return AddressType.objects.all()


def create_contact_types():
    create_phone_number_types()
    create_email_types()
    create_address_types()


def create_contact_state(state_code=STATE_CODE, **kwargs):
    try:
        return State.objects.get(state_code=state_code)
    except State.MultipleObjectsReturned:
        return State.objects.filter(state_code=state_code)[0]
    except State.DoesNotExist:
        country = kwargs.get('country', mommy.make(Country, common_name=COUNTRY_COMMON_NAME))
        return mommy.make(State, name=state_code, state_code=state_code, country=country)


def create_contact_country(common_name=COUNTRY_COMMON_NAME):
    try:
        return Country.objects.get(common_name=common_name)
    except Country.DoesNotExist:
        country = mommy.make(Country, common_name=common_name)
        mommy.make(State, state_code=STATE_CODE, country=country)
        mommy.make(State, state_code=STATE_CODE_TWO, country=country)
        return country


def add_office_to_location(location):
    address = create_contact(Address, location)
    office = create_address_type('admin.address_type.office')
    address.type = office
    address.save()
    location.addresses.add(address)
