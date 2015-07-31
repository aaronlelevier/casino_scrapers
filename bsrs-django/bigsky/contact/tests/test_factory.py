from django.test import TestCase

from contact.tests import factory
from contact.models import PhoneNumber, Address, Email
from person.models import Person


class FactoryTests(TestCase):

    def test_create_person_and_contacts(self):
        person = factory.create_person_and_contacts()
        self.assertIsInstance(person, Person)
        self.assertIsInstance(person.emails.first(), Email)