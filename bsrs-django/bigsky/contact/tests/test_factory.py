from django.test import TestCase

from contact.tests import factory
from contact.models import Email, Address, PhoneNumber
from person.models import Person
from person.tests.factory import create_person
from utils.helpers import generate_uuid


class FactoryTests(TestCase):

    def test_create_contact(self):
        person = create_person()

        email = factory.create_contact(Email, person)

        self.assertIsInstance(email, Email)
        self.assertEqual(
            str(email.id),
            generate_uuid(factory.EMAIL_BASE_ID)
        )
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

    def test_get_create_contact_method(self):
        ret = factory.get_create_contact_method(Email)

        self.assertEqual(ret, factory.create_email)

    def test_create_phone_number(self):
        incr = 0
        self.assertEqual(PhoneNumber.objects.count(), incr)
        person = create_person()
        base_id = factory.PHONE_NUMBER_BASE_ID

        ret = factory.create_phone_number(person)

        self.assertEqual(PhoneNumber.objects.count(), incr+1)
        self.assertEqual(
            str(ret.id),
            generate_uuid(base_id, incr)
        )

    def test_create_address(self):
        incr = 0
        self.assertEqual(Address.objects.count(), incr)
        person = create_person()
        base_id = factory.ADDRESS_BASE_ID

        ret = factory.create_address(person)

        self.assertEqual(Address.objects.count(), incr+1)
        self.assertEqual(
            str(ret.id),
            generate_uuid(base_id, incr)
        )

    def test_create_email(self):
        incr = 0
        self.assertEqual(Email.objects.count(), incr)
        person = create_person()
        base_id = factory.EMAIL_BASE_ID

        ret = factory.create_email(person)

        self.assertEqual(Email.objects.count(), incr+1)
        self.assertEqual(
            str(ret.id),
            generate_uuid(base_id, incr)
        )
