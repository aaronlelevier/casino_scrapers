from model_mommy import mommy

from contact.models import PhoneNumber, Address, Email
from person.models import Person
from person.tests.factory import create_person


def create_person_and_contacts(person=None):
    if not person:
        person = create_person()
    for model in [PhoneNumber, Address, Email]:
        mommy.make(model, person=person)
    return person