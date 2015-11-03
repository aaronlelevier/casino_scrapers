from model_mommy import mommy

from contact.models import PhoneNumber, Address, Email


def create_contact(model, content_object):
    """
    `object_id` is a UUID, which `model_mommy` doesn't know how to make,
    so it must be specified.
    """
    return mommy.make(model, content_object=content_object,
        object_id=content_object.id)


def create_contacts(instance):
    for model in [PhoneNumber, Address, Email]:
        mommy.make(model, content_object=instance, object_id=instance.id)
