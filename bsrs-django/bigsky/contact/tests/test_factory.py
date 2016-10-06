from mock import patch

from django.test import TestCase

from contact.models import (
    State, Country, PhoneNumber, PhoneNumberType, Email, EmailType,
    Address, AddressType, PHONE_NUMBER_TYPES, EMAIL_TYPES, ADDRESS_TYPES,
    OFFICE_ADDRESS_TYPE)
from contact.tests import factory
from location.tests.factory import create_location
from person.tests.factory import create_person


class FactoryTests(TestCase):

    def test_create_contact(self):
        person = create_person()

        email = factory.create_contact(Email, person)

        self.assertIsInstance(email, Email)
        self.assertEqual(str(email.content_object.id), str(person.id))

    def test_create_contact__with_type(self):
        person = create_person()
        address_type = factory.create_address_type(OFFICE_ADDRESS_TYPE)

        ret = factory.create_contact(Address, person, address_type)

        self.assertEqual(ret.type, address_type)

    def test_create_contacts(self):
        person = create_person()

        factory.create_contacts(person)

        self.assertEqual(person.phone_numbers.count(), 1)
        self.assertEqual(person.addresses.count(), 1)
        self.assertEqual(person.emails.count(), 1)

    def test_create_phone_number(self):
        person = create_person()
        init_count = PhoneNumber.objects.count()

        ret = factory.create_contact(PhoneNumber, person)

        self.assertEqual(PhoneNumber.objects.count(), init_count+1)
        self.assertIsInstance(ret, PhoneNumber)
        self.assertEqual(ret.content_object, person)

    def test_create_address(self):
        person = create_person()
        init_count = Address.objects.count()

        ret = factory.create_contact(Address, person)

        self.assertEqual(Address.objects.count(), init_count+1)
        self.assertIsInstance(ret, Address)
        self.assertEqual(ret.content_object, person)

    def test_create_email(self):
        person = create_person()
        init_count = Email.objects.count()

        ret = factory.create_contact(Email, person)

        self.assertEqual(Email.objects.count(), init_count+1)
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
    def test_create_contact_types(self, address_mock, email_mock, ph_num_mock):
        self.assertTrue(address_mock.was_called)
        self.assertTrue(email_mock.was_called)
        self.assertTrue(ph_num_mock.was_called)

    def test_create_address(self):
        ret = factory.create_address()
        self.assertIsInstance(ret, Address)
        self.assertIsInstance(ret.type, AddressType)
        self.assertIsInstance(ret.state, State)
        self.assertTrue(ret.state.name)
        self.assertIsInstance(ret.country, Country)
        self.assertTrue(ret.country.common_name)

    def test_create_contact_state(self):
        ret = factory.create_contact_state()
        self.assertIsInstance(ret, State)
        self.assertIsInstance(ret.country, Country)
        self.assertEqual(ret.state_code, factory.STATE_CODE)
        self.assertEqual(ret.name, factory.STATE_CODE)

    def test_create_contact_state__with_country(self):
        country = factory.create_contact_country()
        state = factory.create_contact_state(country=country)
        self.assertEqual(state.country, country)

    def test_create_contact_country(self):
        ret = factory.create_contact_country()
        self.assertIsInstance(ret, Country)
        self.assertEqual(ret.states.count(), 2)
        self.assertEqual(ret.common_name, factory.COUNTRY_COMMON_NAME)

    def test_add_office_to_location(self):
        location = create_location()
        self.assertFalse(location.is_office_or_store)

        factory.add_office_to_location(location)

        self.assertTrue(location.is_office_or_store)

    def test_create_contact_fixtures(self):
        factory.create_contact_fixtures()

        # email
        email = Email.objects.order_by('id')[0]
        self.assertTrue(str(email.id).endswith('001'), str(email.id))
        # email 2
        email_two = Email.objects.order_by('id')[1]
        self.assertTrue(str(email_two.id).endswith('002'), str(email_two.id))
        # phone number
        ph = PhoneNumber.objects.first()
        self.assertTrue(str(ph.id).endswith('001'))
        self.assertEqual(len(ph.number.split('-')[0]), 3)
        self.assertEqual(len(ph.number.split('-')[1]), 3)
        self.assertEqual(len(ph.number.split('-')[2]), 4)
        # address
        address = Address.objects.first()
        self.assertTrue(str(address.id).endswith('001'))
        self.assertTrue(address.city)
        self.assertTrue(address.postal_code)

        # all types should be created w/ incrementing uuids
        # email
        self.assertEqual(EmailType.objects.count(), len(EMAIL_TYPES))
        for i, obj in enumerate(EmailType.objects.order_by('id')):
            self.assertEqual(str(obj.id)[-1], str(i+1))
        # ph
        self.assertEqual(PhoneNumberType.objects.count(), len(PHONE_NUMBER_TYPES))
        for i, obj in enumerate(PhoneNumberType.objects.order_by('id')):
            self.assertEqual(str(obj.id)[-1], str(i+1))
        # address
        self.assertEqual(AddressType.objects.count(), len(ADDRESS_TYPES))
        for i, obj in enumerate(AddressType.objects.order_by('id')):
            self.assertEqual(str(obj.id)[-1], str(i+1))
