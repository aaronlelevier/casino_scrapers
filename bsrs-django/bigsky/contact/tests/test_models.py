from mock import patch
import os

from django.conf import settings
from django.test import TestCase

from model_mommy import mommy

from automation.helpers import Interpolate
from automation.tests.factory import create_automation_action_send_email, create_automation_action_send_sms
from contact.models import (State, StateManager, StateQuerySet, Country, PhoneNumber,
    PhoneNumberManager, PhoneNumberType, Address, AddressType, Email, EmailType, EmailManager)
from contact.tests.factory import (create_contact, create_address_type, create_email_type,
    create_email_types, create_phone_number_type)
from location.models import Location
from location.tests.factory import create_location
from person.models import Role, Person
from person.tests.factory import create_person, create_single_person
from tenant.tests.factory import get_or_create_tenant
from ticket.models import Ticket, TicketStatus, TicketActivity, TicketActivityType
from ticket.tests.factory import create_standard_ticket, create_ticket
from translation.tests.factory import create_translation_keys_for_fixtures
from utils.tests.test_helpers import create_default


class StateManagerTests(TestCase):

    def test_queryset_cls(self):
        self.assertEqual(StateManager.queryset_cls, StateQuerySet)

    def test_tenant(self):
        tenant = get_or_create_tenant()
        self.assertEqual(tenant.countries.count(), 1)
        country = tenant.countries.first()

        ret = State.objects.tenant(tenant)

        self.assertEqual(ret.count(), 1)
        self.assertEqual(ret[0].country, country)


class StateTests(TestCase):

    def test_manager(self):
        self.assertIsInstance(State.objects, StateManager)


class EmailAndSmsMixinTests(TestCase):

    def test_get_recipients(self):
        action = create_automation_action_send_sms()
        person = Person.objects.get(id=action.content['recipients'][0]['id'])
        role = Role.objects.get(id=action.content['recipients'][1]['id'])
        person_two = create_single_person()
        person_two.role = role
        person_two.save()
        ticket = create_ticket(assignee=person_two)
        person.role = role
        person.save()
        person.locations.add(ticket.location)
        # pre-test
        self.assertIn(ticket.location, person_two.locations.all())
        self.assertEqual(role, person_two.role)

        ret = PhoneNumber.objects.get_recipients(action, ticket)

        self.assertEqual(ret.count(), ret.distinct().count())
        self.assertEqual(ret.count(), 2)
        self.assertIn(person, ret)
        self.assertIn(person_two, ret)


class PhoneNumberManagerTests(TestCase):

    def setUp(self):
        self.action = create_automation_action_send_sms()
        self.event = self.action.automation.events.first()
        self.person = Person.objects.get(id=self.action.content['recipients'][0]['id'])
        self.translation = create_translation_keys_for_fixtures(self.person.locale.locale)
        mommy.make(TicketActivityType, name=TicketActivityType.SEND_SMS)
        self.ticket = create_standard_ticket()

    @patch("contact.models.PhoneNumberManager.send_sms")
    def test_process_send_sms__no_sms(self, mock_func):
        self.assertEqual(self.person.phone_numbers.count(), 0)

        PhoneNumber.objects.process_send_sms(self.ticket, self.action, self.event.key)

        self.assertFalse(mock_func.called)

    @patch("contact.models.PhoneNumberManager.send_sms")
    def test_process_send_sms__send_sms_called(self, mock_func):
        work_sms_type = create_phone_number_type(PhoneNumberType.TELEPHONE)
        phone = create_contact(PhoneNumber, self.person, work_sms_type)
        self.action.content.update({
            'body': "Priority {{ticket.priority}} to view the ticket go to {{ticket.url}}"
        })
        interpolate = Interpolate(self.ticket, self.translation, event=self.event.key)
        body = interpolate.text(self.action.content['body'])

        PhoneNumber.objects.process_send_sms(self.ticket, self.action, self.event.key)

        self.assertEqual(mock_func.call_args[0][0], phone)
        self.assertEqual(mock_func.call_args[0][1], body)

    @patch("contact.models.PhoneNumberManager.send_sms")
    @patch("contact.models.Interpolate")
    def test_process_send_sms__calls_send_sms_with_interpolate(self, mock_interpolate, mock_send_sms):
        work_sms_type = create_phone_number_type(PhoneNumberType.CELL)
        create_contact(PhoneNumber, self.person, work_sms_type)

        PhoneNumber.objects.process_send_sms(self.ticket, self.action, self.event.key)

        self.assertEqual(mock_interpolate.call_args[0][0], self.ticket)
        self.assertEqual(mock_interpolate.call_args[0][1], self.translation)
        self.assertEqual(mock_interpolate.call_args[1]['event'], self.event.key)

        self.assertTrue(mock_send_sms.called)

    @patch("contact.models.PhoneNumberManager.send_sms")
    def test_process_send_sms__called_for_person_and_role(self, mock_func):
        work_sms_type = create_phone_number_type(PhoneNumberType.CELL)
        person_phone = create_contact(PhoneNumber, self.person, work_sms_type)
        role = Role.objects.get(id=self.action.content['recipients'][1]['id'])
        person_two = create_single_person()
        person_two.role = role
        person_two.save()
        person_two.locations.add(self.ticket.location)
        person_two_phone = create_contact(PhoneNumber, person_two, work_sms_type)

        PhoneNumber.objects.process_send_sms(self.ticket, self.action, self.event.key)

        self.assertEqual(mock_func.call_count, 2)
        phone_call_args = [mock_func.call_args_list[0][0][0],
                        mock_func.call_args_list[1][0][0]]
        self.assertIn(person_phone, phone_call_args)
        self.assertIn(person_two_phone, phone_call_args)

    @patch("contact.models.PhoneNumberManager.send_sms")
    def test_process_send_sms__ticket_activity_is_created(self, mock_func):
        # 1 recipient has 2 sms phs
        cell_sms_type = create_phone_number_type(PhoneNumberType.CELL)
        office_sms_type = create_phone_number_type(PhoneNumberType.OFFICE)
        create_contact(PhoneNumber, self.person, cell_sms_type)
        create_contact(PhoneNumber, self.person, office_sms_type)
        # 2nd recipient just 1 sms ph
        role = Role.objects.get(id=self.action.content['recipients'][1]['id'])
        person_two = create_single_person()
        person_two.role = role
        person_two.save()
        person_two.locations.add(self.ticket.location)
        person_two_phone = create_contact(PhoneNumber, person_two, cell_sms_type)
        # pre-test
        init_count = TicketActivity.objects.count()

        PhoneNumber.objects.process_send_sms(self.ticket, self.action, self.event.key)

        # send_sms is called 3x, but only 2 People records are logged
        # because each should be unique
        self.assertEqual(mock_func.call_count, 3)
        self.assertEqual(TicketActivity.objects.count(), init_count+1)
        activity = TicketActivity.objects.first()
        self.assertEqual(activity.type.name, TicketActivityType.SEND_SMS)
        self.assertEqual(activity.ticket, self.ticket)
        self.assertIsNone(activity.person)
        self.assertEqual(sorted(activity.content), sorted([str(self.person.id), str(person_two.id)]))


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
        self.event = self.action.automation.events.first()
        self.person = Person.objects.get(id=self.action.content['recipients'][0]['id'])
        self.translation = create_translation_keys_for_fixtures(self.person.locale.locale)
        mommy.make(TicketActivityType, name=TicketActivityType.SEND_EMAIL)
        self.ticket = create_standard_ticket()

    @patch("contact.models.EmailManager.send_email")
    def test_process_send_email__no_email(self, mock_func):
        self.assertEqual(self.person.emails.count(), 0)

        Email.objects.process_send_email(self.ticket, self.action, self.event.key)

        self.assertFalse(mock_func.called)

    @patch("contact.models.EmailManager.send_email")
    def test_process_send_email__email_is_not_type_work(self, mock_func):
        email_types = create_email_types()
        for et in email_types:
            create_contact(Email, self.person, et)
        # pre-test - # of email types
        self.assertEqual(email_types.count(), 4)
        self.assertEqual(self.person.emails.count(), 4)

        Email.objects.process_send_email(self.ticket, self.action, self.event.key)

        self.assertEqual(mock_func.call_count, 4, "should have been called 1x for each email")

    @patch("contact.models.EmailManager.send_email")
    def test_process_send_email__is_called_with_html_and_text_content(self, mock_func):
        subject = 'Foo'
        self.action.content['subject'] = subject
        work_email_type = create_email_type(EmailType.WORK)
        person_email = create_contact(Email, self.person, work_email_type)

        Email.objects.process_send_email(self.ticket, self.action, self.event.key)

        self.assertEqual(mock_func.call_count, 1)
        self.assertEqual(mock_func.call_args[0][0], person_email)
        self.assertTrue(mock_func.call_args[0][1], subject)
        self.assertTrue(mock_func.call_args[1]['html_content'])
        self.assertTrue(mock_func.call_args[1]['text_content'])

    @patch("contact.models.Interpolate")
    def test_process_send_email__calls_send_email_with_interpolate(self, mock_func):
        work_email_type = create_email_type(EmailType.WORK)
        create_contact(Email, self.person, work_email_type)

        Email.objects.process_send_email(self.ticket, self.action, self.event.key)

        self.assertEqual(mock_func.call_args[0][0], self.ticket)
        self.assertEqual(mock_func.call_args[0][1], self.translation)
        self.assertEqual(mock_func.call_args[1]['event'], self.event.key)

    @patch("contact.models.Interpolate.get_html_email")
    def test_process_send_email__get_html_email__has_ticket_activity(self, mock_func):
        mock_func.return_value = '<body>foo</body'
        self.action.content['body'] = "Foo {{ticket.activity}} bar"
        html_base_template = os.path.join(settings.TEMPLATES_DIR,
                                     'email/test/base.html')
        work_email_type = create_email_type(EmailType.WORK)
        create_contact(Email, self.person, work_email_type)

        Email.objects.process_send_email(self.ticket, self.action, self.event.key)

        self.assertEqual(mock_func.call_args[0][0], html_base_template)
        self.assertEqual(len(mock_func.call_args[1]), 3)
        self.assertTrue(mock_func.call_args[1]['body'])
        self.assertTrue(mock_func.call_args[1]['ticket_activity'])
        self.assertEqual(mock_func.call_args[1]['ticket'], self.ticket)

    @patch("contact.models.Interpolate.get_html_email")
    def test_process_send_email__get_html_email__no_ticket_activity(self, mock_func):
        mock_func.return_value = '<body>foo</body'
        self.action.content['body'] = "Foo bar"
        html_base_template = os.path.join(settings.TEMPLATES_DIR,
                                     'email/test/base.html')
        work_email_type = create_email_type(EmailType.WORK)
        create_contact(Email, self.person, work_email_type)

        Email.objects.process_send_email(self.ticket, self.action, self.event.key)

        self.assertEqual(mock_func.call_args[0][0], html_base_template)
        self.assertEqual(len(mock_func.call_args[1]), 1)
        self.assertTrue(mock_func.call_args[1]['body'])

    @patch("contact.models.Interpolate.get_text_email")
    def test_process_send_email__get_text_email__has_ticket_activity(self, mock_func):
        self.action.content['body'] = "Foo {{ticket.activity}} bar"
        html_base_template = os.path.join(settings.TEMPLATES_DIR,
                                     'email/test/base.html')
        work_email_type = create_email_type(EmailType.WORK)
        create_contact(Email, self.person, work_email_type)

        Email.objects.process_send_email(self.ticket, self.action, self.event.key)

        self.assertEqual(mock_func.call_args[0][0], html_base_template)
        self.assertEqual(len(mock_func.call_args[1]), 3)
        self.assertTrue(mock_func.call_args[1]['body'])
        self.assertTrue(mock_func.call_args[1]['ticket_activity'])
        self.assertEqual(mock_func.call_args[1]['ticket'], self.ticket)

    @patch("contact.models.EmailManager.send_email")
    def test_process_send_email__called_for_person_and_role(self, mock_func):
        work_email_type = create_email_type(EmailType.WORK)
        person_email = create_contact(Email, self.person, work_email_type)
        role = Role.objects.get(id=self.action.content['recipients'][1]['id'])
        person_two = create_single_person()
        person_two.role = role
        person_two.save()
        person_two.locations.add(self.ticket.location)
        person_two_email = create_contact(Email, person_two, work_email_type)

        Email.objects.process_send_email(self.ticket, self.action, self.event.key)

        self.assertEqual(mock_func.call_count, 2)
        email_call_args = [mock_func.call_args_list[0][0][0],
                        mock_func.call_args_list[1][0][0]]
        self.assertIn(person_email, email_call_args)
        self.assertIn(person_two_email, email_call_args)

    @patch("contact.models.EmailManager.send_email")
    def test_process_send_email__ticket_activity_is_created(self, mock_func):
        # 1 recipient has 2 emails
        work_email_type = create_email_type(EmailType.WORK)
        personal_email_type = create_email_type(EmailType.PERSONAL)
        person_work_email = create_contact(Email, self.person, work_email_type)
        person_personal_email = create_contact(Email, self.person, personal_email_type)
        # 2nd recipient just  1 email
        role = Role.objects.get(id=self.action.content['recipients'][1]['id'])
        person_two = create_single_person()
        person_two.role = role
        person_two.save()
        person_two.locations.add(self.ticket.location)
        person_two_email = create_contact(Email, person_two, work_email_type)
        # pre-test
        init_count = TicketActivity.objects.count()

        Email.objects.process_send_email(self.ticket, self.action, self.event.key)

        # send_email is called 3x, but only 2 People records are logged
        # because each should be unique
        self.assertEqual(mock_func.call_count, 3)
        self.assertEqual(TicketActivity.objects.count(), init_count+1)
        activity = TicketActivity.objects.first()
        self.assertEqual(activity.type.name, TicketActivityType.SEND_EMAIL)
        self.assertEqual(activity.ticket, self.ticket)
        self.assertIsNone(activity.person)
        self.assertEqual(sorted(activity.content), sorted([str(self.person.id), str(person_two.id)]))


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
