from django.test import TestCase

from contact.tests import factory
from contact.models import Email
from location.models import Location
from person.models import Person


class FactoryTests(TestCase):

    def test_create_person_and_contacts(self):
        person = factory.create_person_and_contacts()
        self.assertIsInstance(person, Person)
        self.assertIsInstance(Email.objects.get(object_id=person.id), Email)

    def test_create_location_and_contacts(self):
        location = factory.create_location_and_contacts()
        self.assertIsInstance(location, Location)
        self.assertIsInstance(Email.objects.get(object_id=location.id), Email)