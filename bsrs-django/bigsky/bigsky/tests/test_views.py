import json
from datetime import timedelta

from django.test import TestCase
from django.conf import settings
from django.core.urlresolvers import reverse
from django.utils import timezone

from model_mommy import mommy

from accounting.models import Currency
from person.models import Person, PersonStatus, Role
from ticket.models import Ticket, TicketStatus, TicketPriority
from contact.models import PhoneNumberType, AddressType
from generic.models import SavedSearch
from location.models import LocationLevel, LocationStatus, State, Country
from person.tests.factory import PASSWORD, create_person, create_role
from translation.tests.factory import create_locales


class IndexTests(TestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()

    def test_logged_in(self):
        self.client.login(username=self.person.username, password=self.password)
        response = self.client.get(reverse('index'))
        self.assertEqual(response.status_code, 200)

    def test_logged_out(self):
        response = self.client.get(reverse('index'))
        self.assertRedirects(response, reverse('login')+'?next='+reverse('index'))

    def test_logout(self):
        self.client.login(username=self.person.username, password=self.password)
        self.assertIn('_auth_user_id', self.client.session)
        self.client.get(reverse('logout'))
        self.assertNotIn('_auth_user_id', self.client.session)

    def test_password_change_get(self):
        self.client.login(username=self.person.username, password=self.password)
        response = self.client.get(reverse('password_change'))
        self.assertEqual(response.status_code, 200)

    def test_password_change_post(self):
        self.client.login(username=self.person.username, password=self.password)
        new_password = "my-new-password"
        response = self.client.post(reverse('password_change'),
            {'old_password': self.password, 'new_password1': new_password,
            'new_password2': new_password})
        self.assertRedirects(response, reverse('index'))
        self.assertIn('_auth_user_id', self.client.session)

    def test_password_expired(self):
        self.person.password_expire_date = timezone.now().date() - timedelta(days=1)
        self.person.save()
        self.client.login(username=self.person.username, password=self.password)
        response = self.client.get(reverse('index'))
        self.assertRedirects(response, reverse('password_change')+'?next='+reverse('index'))


class LoginTests(TestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()

    def test_login_unauthenticated(self):
        response = self.client.get(reverse('login'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context['submit_button'], 'Login')

    def test_login_authenticated(self):
        self.client.login(username=self.person.username, password=self.password)
        response = self.client.get(reverse('login'))
        self.assertRedirects(response, settings.LOGIN_REDIRECT_URL)


class ConfigurationTests(TestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        self.phone_number_types = mommy.make(PhoneNumberType)
        self.location_levels = mommy.make(LocationLevel)
        self.location_statuses = mommy.make(LocationStatus)
        self.person_status = mommy.make(PersonStatus)
        self.ticket_status = mommy.make(TicketStatus)
        self.ticket_priority = mommy.make(TicketPriority)
        self.saved_search = mommy.make(SavedSearch, person=self.person, name="foo",
            endpoint_name="admin.people.index")
        # Login
        self.client.login(username=self.person.username, password=self.password)

    def tearDown(self):
        self.client.logout()

    def test_get(self):
        response = self.client.get(reverse('index'))
        self.assertEqual(response.status_code, 200)

    def test_phone_number_types(self):
        response = self.client.get(reverse('index'))
        self.assertTrue(response.context['phone_number_types_config'])

    def test_address_types(self):
        mommy.make(AddressType)
        response = self.client.get(reverse('index'))
        configuration = json.loads(response.context['address_types'])
        self.assertTrue(len(configuration) > 0)

    def test_states_us(self):
        mommy.make(State)
        response = self.client.get(reverse('index'))
        configuration = json.loads(response.context['states_us'])
        self.assertTrue(len(configuration) > 0)

    def test_countries(self):
        mommy.make(Country)
        response = self.client.get(reverse('index'))
        configuration = json.loads(response.context['countries'])
        self.assertTrue(len(configuration) > 0)

    def test_roles(self):
        response = self.client.get(reverse('index'))
        configuration = json.loads(response.context['role_config'])
        self.assertTrue(len(configuration) > 0)
        # the model id shows in the context
        self.assertIn(str(self.person.role.id), [c["id"] for c in configuration])
        self.assertIn(str(self.person.role.name), [c["name"] for c in configuration])
        self.assertIn(str(self.person.role.location_level.id), [c["location_level"] for c in configuration])
        role = Role.objects.first()
        role.location_level = None
        role.save()
        response = self.client.get(reverse('index'))
        configuration = json.loads(response.context['role_config'])
        self.assertTrue(len(configuration) > 0)
        self.assertIn(str(role.id), [c["id"] for c in configuration])
        with self.assertRaises(KeyError):
            configuration[0]["location_level"]
        
    def test_role_types(self):
        response = self.client.get(reverse('index'))
        configuration = json.loads(response.context['role_types_config'])
        self.assertTrue(len(configuration) > 0)
        # the model id shows in the context
        self.assertEqual("Internal", configuration[0])
        self.assertEqual("Third Party", configuration[1])

    def test_person_statuses(self):
        response = self.client.get(reverse('index'))
        configuration = json.loads(response.context['person_status_config'])
        self.assertTrue(len(configuration) > 0)
        # the model id shows in the context
        self.assertIn(str(self.person_status.id), [c['id'] for c in configuration])
        self.assertIn(str(self.person_status.name), [c['name'] for c in configuration])

    def test_ticket_statuses(self):
        response = self.client.get(reverse('index'))
        configuration = json.loads(response.context['ticket_statuses'])
        self.assertTrue(len(configuration) > 0)
        self.assertIn(str(self.ticket_status.id), [c['id'] for c in configuration])

    def test_ticket_priorities(self):
        response = self.client.get(reverse('index'))
        configuration = json.loads(response.context['ticket_priorities'])
        self.assertTrue(len(configuration) > 0)
        self.assertIn(str(self.ticket_priority.id), [c['id'] for c in configuration])
        self.assertIn(str(self.ticket_priority.name), [c['name'] for c in configuration])

    def test_location_level(self):
        response = self.client.get(reverse('index'))
        configuration = json.loads(response.context['location_level_config'])
        self.assertTrue(len(configuration) > 0)
        # the model id shows in the context
        self.assertIn(str(self.location_levels.id), [c['id'] for c in configuration])
        self.assertIn(str(self.location_levels.name), [c['name'] for c in configuration])

    def test_location_status(self):
        response = self.client.get(reverse('index'))
        configuration = json.loads(response.context['location_status_config'])
        self.assertTrue(len(configuration) > 0)

    def test_locales(self):
        create_locales()
        response = self.client.get(reverse('index'))
        configuration = json.loads(response.context['locales'])
        self.assertTrue(len(configuration) > 0)

    def test_currency(self):
        currency = Currency.objects.default()
        response = self.client.get(reverse('index'))
        configuration = json.loads(response.context['currencies'])
        # test
        self.assertTrue(len(configuration) > 0)
        configuration_usd = configuration[currency.code]
        self.assertTrue(configuration_usd)
        self.assertEqual(configuration_usd['name'], currency.name)

    def test_current_person(self):
        Currency.objects.default()
        response = self.client.get(reverse('index'))
        configuration = json.loads(response.context['person_current'])
        self.assertTrue(len(configuration) > 0)

    def test_default_model_ordering(self):
        response = self.client.get(reverse('index'))
        configuration = json.loads(response.context['default_model_ordering'])
        self.assertTrue(len(configuration) > 0)

    def test_context_saved_search(self):
        response = self.client.get(reverse('index'))
        configuration = json.loads(response.context['saved_search'])
        self.assertTrue(len(configuration) > 0)

