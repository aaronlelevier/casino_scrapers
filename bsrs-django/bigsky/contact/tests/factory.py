from model_mommy import mommy

from contact.models import PhoneNumber, Address, Email
from location.models import Location
from person.tests.factory import create_person


def create_contact(model, content_object):
    """
    `object_id` is a UUID, which `model_mommy` doesn't know how to make, 
    so it must be specified.
    """
    return mommy.make(model, content_object=content_object,
        object_id=content_object.id)


def create_person_and_contacts(person=None):
    if not person:
        person = create_person()
    for model in [PhoneNumber, Address, Email]:
        mommy.make(model, content_object=person, object_id=person.id)
    return person


def create_location_and_contacts(location=None):
    if not location:
        location = mommy.make(Location)
    for model in [PhoneNumber, Address, Email]:
        mommy.make(model, content_object=location, object_id=location.id)
    return location