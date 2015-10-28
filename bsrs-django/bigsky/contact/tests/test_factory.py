from django.test import TestCase

from contact.tests import factory
from contact.models import Email, Address
from person.models import Person
from person.tests.factory import create_person


class FactoryTests(TestCase):

    def test_create_contact(self):
        person = create_person()
        email = factory.create_contact(Email, person)
        self.assertIsInstance(email, Email)

    def test_create_person_and_contacts(self):
        person = create_person()
        factory.create_contacts(person)
        self.assertIsInstance(person, Person)
        self.assertIsInstance(Address.objects.get(object_id=person.id), Address)
