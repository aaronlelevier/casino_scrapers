from mock import patch

from django.test import TestCase

from contact.models import (PhoneNumber, PhoneNumberType, Email, EmailType,
    Address, AddressType, PHONE_NUMBER_TYPES, EMAIL_TYPES, ADDRESS_TYPES)
from contact.tests import factory
from person.models import Person
from person.tests.factory import create_person


class FactoryTests(TestCase):

    def test_create_contact(self):
        person = create_person()

        email = factory.create_contact(Email, person)

        self.assertIsInstance(email, Email)
        self.assertEqual(str(email.content_object.id), str(person.id))

    def test_create_contacts(self):
        person = create_person()

        factory.create_contacts(person)

        # phone_number
        self.assertEqual(PhoneNumber.objects.count(), 1)
        phone_number = PhoneNumber.objects.first()
        self.assertEqual(str(phone_number.content_object.id), str(person.id))
        # address
        self.assertEqual(Address.objects.count(), 1)
        address = Address.objects.first()
        self.assertEqual(str(address.content_object.id), str(person.id))
        # email
        self.assertEqual(Email.objects.count(), 1)
        email = Email.objects.first()
        self.assertEqual(str(email.content_object.id), str(person.id))

    @patch("contact.tests.factory.load_create_contact")
    def test_get_create_contact_method(self, mock_call):
        ret = factory.get_create_contact_method(Email)

        self.assertTrue(mock_call.was_called)

    def test_create_phone_number(self):
        self.assertEqual(PhoneNumber.objects.count(), 0)
        person = create_person()

        ret = factory.create_contact(PhoneNumber, person)

        self.assertEqual(PhoneNumber.objects.count(), 1)
        self.assertIsInstance(ret, PhoneNumber)
        self.assertEqual(ret.content_object, person)

    def test_create_address(self):
        self.assertEqual(Address.objects.count(), 0)
        person = create_person()

        ret = factory.create_contact(Address, person)

        self.assertEqual(Address.objects.count(), 1)
        self.assertIsInstance(ret, Address)
        self.assertEqual(ret.content_object, person)

    def test_create_email(self):
        self.assertEqual(Email.objects.count(), 0)
        person = create_person()

        ret = factory.create_contact(Email, person)

        self.assertEqual(Email.objects.count(), 1)
        self.assertIsInstance(ret, Email)
        self.assertEqual(ret.content_object, person)

    def test_create_phone_number_type(self):
        ret = factory.create_phone_number_type()

        self.assertIsInstance(ret, PhoneNumberType)

    def test_create_phone_number_types(self):
        types = factory.create_phone_number_types()

        for t in types:
            self.assertIn(t.name, PHONE_NUMBER_TYPES)

        self.assertEqual(types.count(), len(PHONE_NUMBER_TYPES))

    def test_create_email_type(self):
        ret = factory.create_email_type()

        self.assertIsInstance(ret, EmailType)

    def test_create_email_types(self):
        types = factory.create_email_types()

        for t in types:
            self.assertIn(t.name, EMAIL_TYPES)

        self.assertEqual(types.count(), len(EMAIL_TYPES))

    def test_create_address_type(self):
        ret = factory.create_address_type()

        self.assertIsInstance(ret, AddressType)

    def test_create_address_types(self):
        types = factory.create_address_types()

        for t in types:
            self.assertIn(t.name, ADDRESS_TYPES)

        self.assertEqual(types.count(), len(ADDRESS_TYPES))

    @patch("contact.tests.factory.create_phone_number_types")
    @patch("contact.tests.factory.create_email_types")
    @patch("contact.tests.factory.create_address_types")
    def test_create_contact_types(self, phone_mock, email_mock, address_mock):
        self.assertTrue(phone_mock.was_called)
        self.assertTrue(email_mock.was_called)
        self.assertTrue(address_mock.was_called)
