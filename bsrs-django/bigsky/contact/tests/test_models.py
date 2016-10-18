from mock import patch

from django.conf import settings
from django.test import TestCase

from model_mommy import mommy

from automation.tests.factory import create_automation_action_send_email, create_automation_action_send_sms
from contact.models import (State, StateManager, StateQuerySet, Country, PhoneNumber,
    PhoneNumberManager, PhoneNumberType, Address, AddressType, Email, EmailType, EmailManager)
from contact.tests.factory import (create_contact, create_address_type, create_email_type,
    create_phone_number_type)
from location.models import Location
from location.tests.factory import create_location
from person.models import Person
from person.tests.factory import create_person
from tenant.tests.factory import get_or_create_tenant


class StateManagerTests(TestCase):

    def test_queryset_cls(self):
        self.assertEqual(StateManager.queryset_cls, StateQuerySet)

    def test_tenant(self):
        tenant = get_or_create_tenant()
        self.assertEqual(tenant.countries.count(), 1)
        country = tenant.countries.first()

        ret = State.objects.tenant(tenant)

        self.assertEqual(ret.count(), 2)
        self.assertEqual(ret[0].country, country)
        self.assertEqual(ret[1].country, country)


class StateTests(TestCase):

    def test_manager(self):
        self.assertIsInstance(State.objects, StateManager)


class PhoneNumberManagerTests(TestCase):

    def setUp(self):
        self.action = create_automation_action_send_sms()
        self.person = Person.objects.get(id=self.action.content.get('recipients')[0])

    @patch("contact.models.PhoneNumberManager.send_sms")
    def test_process_send_sms__no_sms(self, mock_func):
        PhoneNumber.objects.process_send_sms(self.action)

        self.assertFalse(mock_func.called)

    @patch("contact.models.PhoneNumberManager.send_sms")
    def test_process_send_sms__sms_is_not_type_cell_(self, mock_func):
        personal_sms_type = create_phone_number_type(PhoneNumberType.TELEPHONE)
        create_contact(PhoneNumber, self.person, personal_sms_type)
        # clear log
        with open(settings.LOGGING_INFO_FILE, 'w'): pass

        PhoneNumber.objects.process_send_sms(self.action)

        self.assertFalse(mock_func.called)
        # Log
        with open(settings.LOGGING_INFO_FILE, 'r') as f:
            content = f.read()
        self.assertIn("Person: {person.id}; Fullname: {person.fullname} not sent SMS " \
                      "because has no CELL phone number on file, for SMS with body: {body}"
                      .format(person=self.person, body=self.action.content['body']), content)

    @patch("contact.models.PhoneNumberManager.send_sms")
    def test_process_send_sms__sms_is_type_cell(self, mock_func):
        work_sms_type = create_phone_number_type(PhoneNumberType.CELL)
        create_contact(PhoneNumber, self.person, work_sms_type)

        PhoneNumber.objects.process_send_sms(self.action)

        self.assertTrue(mock_func.called)


class PhoneNumberTests(TestCase):

    def setUp(self):
        self.person = create_person()
        self.location = mommy.make(Location)
        self.ph_type = mommy.make(PhoneNumberType)
        self.ph = create_contact(PhoneNumber, self.person)

    def test_create(self):
        self.assertIsInstance(self.ph, PhoneNumber)
        self.assertIsInstance(self.ph.type, PhoneNumberType)
        self.assertIsInstance(self.ph.content_object, Person)

    def test_manager(self):
        self.assertIsInstance(PhoneNumber.objects, PhoneNumberManager)

    def test_ordering(self):
        create_contact(PhoneNumber, self.person)
        self.assertTrue(PhoneNumber.objects.count() > 1)

        self.assertEqual(
            PhoneNumber.objects.first().id,
            PhoneNumber.objects.order_by('number').first().id
        )

    ### BaseContactModel tests

    def test_content_object_person(self):
        self.assertIsInstance(self.ph.content_object, Person)

    def test_generic_fk_filter(self):
        self.assertEqual(PhoneNumber.objects.filter(object_id=self.person.id).count(), 1)

    def test_generic_fd_get(self):
        ph = PhoneNumber.objects.get(object_id=self.person.id)
        self.assertIsInstance(ph, PhoneNumber)
        self.assertEqual(str(ph.content_object.id), str(self.person.id))
        self.assertEqual(str(ph.object_id), str(self.person.id))


class AddressManagerTests(TestCase):

    def test_office_and_stores(self):
        location_type = create_address_type(AddressType.LOCATION)
        office_type = create_address_type(AddressType.OFFICE)
        store_type = create_address_type(AddressType.STORE)
        shipping_type = create_address_type(AddressType.SHIPPING)

        location = create_location()

        a = create_contact(Address, location, location_type)
        b = create_contact(Address, location, office_type)
        c = create_contact(Address, location, store_type)
        d = create_contact(Address, location, shipping_type)

        ret = Address.objects.office_and_stores()

        self.assertEqual(ret.count(), 2)
        self.assertIn(b, ret)
        self.assertIn(c, ret)


class AddressTests(TestCase):

    def setUp(self):
        self.person = create_person()
        self.location = create_location()
        self.store = create_address_type(AddressType.STORE)
        self.office = create_address_type(AddressType.OFFICE)

    def test_ordering(self):
        create_contact(Address, self.person)
        create_contact(Address, self.person)

        self.assertEqual(
            Address.objects.first().id,
            Address.objects.order_by('address').first().id
        )

    def test_create(self):
        state = mommy.make(State)
        country = mommy.make(Country)
        address_type = mommy.make(AddressType)

        address = Address.objects.create(
            content_object=self.person, object_id=self.person.id,
            type=address_type, address='123 St.', city='San Diego',
            state=state, postal_code='92123', country=country
        )

        self.assertIsInstance(address, Address)
        self.assertIsInstance(address.state, State)
        self.assertEqual(address.state, state)
        self.assertEqual(address.country, country)

    def test_is_office_or_store(self):
        address_type = mommy.make(AddressType)
        address = create_contact(Address, self.location)
        address.type = address_type
        address.save()
        self.assertNotIn(address.type, [self.office, self.store])
        self.assertFalse(address.is_office_or_store)

        address.type = self.office
        address.save()
        self.assertIn(address.type, [self.office, self.store])
        self.assertTrue(address.is_office_or_store)


class EmailManagerTests(TestCase):

    def setUp(self):
        self.action = create_automation_action_send_email()
        self.person = Person.objects.get(id=self.action.content['recipients'][0])

    @patch("contact.models.EmailManager.send_email")
    def test_process_send_email__no_email(self, mock_func):
        Email.objects.process_send_email(self.action)

        self.assertFalse(mock_func.called)

    @patch("contact.models.EmailManager.send_email")
    def test_process_send_email__email_is_not_type_work(self, mock_func):
        personal_email_type = create_email_type(EmailType.PERSONAL)
        create_contact(Email, self.person, personal_email_type)

        Email.objects.process_send_email(self.action)

        self.assertFalse(mock_func.called)

    @patch("contact.models.EmailManager.send_email")
    def test_process_send_email__email_is_type_work(self, mock_func):
        work_email_type = create_email_type(EmailType.WORK)
        create_contact(Email, self.person, work_email_type)

        Email.objects.process_send_email(self.action)

        self.assertTrue(mock_func.called)


class EmailTests(TestCase):

    def setUp(self):
        self.person = create_person()

    def test_manager(self):
        self.assertIsInstance(Email.objects, EmailManager)

    def test_ordering(self):
        create_contact(Email, self.person)
        create_contact(Email, self.person)

        self.assertEqual(
            Email.objects.first().id,
            Email.objects.order_by('email').first().id
        )
