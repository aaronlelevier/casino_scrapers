from django.test import TestCase

from contact.tests import factory
from contact.models import Email, Address, PhoneNumber
from person.models import Person
from person.tests.factory import create_person


class FactoryTests(TestCase):

    def test_create_contact(self):
        person = create_person()

        email = factory.create_contact(Email, person)

        self.assertIsInstance(email, Email)
        self.assertEqual(email.content_object, person)

    def test_create_contacts(self):
        person = create_person()

        factory.create_contacts(person)

        # phone_number
        self.assertEqual(PhoneNumber.objects.count(), 1)
        phone_number = PhoneNumber.objects.first()
        self.assertEqual(phone_number.content_object, person)
        # address
        self.assertEqual(Address.objects.count(), 1)
        address = Address.objects.first()
        self.assertEqual(address.content_object, person)
        # email
        self.assertEqual(Email.objects.count(), 1)
        email = Email.objects.first()
        self.assertEqual(email.content_object, person)
