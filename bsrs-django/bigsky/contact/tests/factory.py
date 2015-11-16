from model_mommy import mommy

from contact.models import PhoneNumber, Address, Email
from utils.helpers import generate_uuid


def create_contact(model, content_object):
    """
    `object_id` is a UUID, which `model_mommy` doesn't know how to make,
    so it must be specified.
    """
    create_method = get_create_contact_method(model)
    return create_method(content_object)


def create_contacts(instance):
    for model in [PhoneNumber, Address, Email]:
        create_method = get_create_contact_method(model)
        create_method(instance)


def get_create_contact_method(model):
    if model == PhoneNumber:
        return create_phone_number
    elif model == Address:
        return create_address
    elif model == Email:
        return create_email


PHONE_NUMBER_BASE_ID = "21f530c4-ce6c-4724-9cfd-37a16e787"


def create_phone_number(instance):
    incr = PhoneNumber.objects.count()
    id = generate_uuid(PHONE_NUMBER_BASE_ID, incr)
    return mommy.make(PhoneNumber, id=id, content_object=instance,
        object_id=instance.id)


ADDRESS_BASE_ID = "22f530c4-ce6c-4724-9cfd-37a16e787"


def create_address(instance):
    incr = Address.objects.count()
    id = generate_uuid(ADDRESS_BASE_ID, incr)
    return mommy.make(Address, id=id, content_object=instance,
        object_id=instance.id)


EMAIL_BASE_ID = "23f530c4-ce6c-4724-9cfd-37a16e787"


def create_email(instance):
    incr = Email.objects.count()
    id = generate_uuid(EMAIL_BASE_ID, incr)
    return mommy.make(Email, id=id, content_object=instance,
        object_id=instance.id)
