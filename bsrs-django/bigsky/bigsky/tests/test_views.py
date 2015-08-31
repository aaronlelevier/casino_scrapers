import json

from django.test import TestCase
from django.conf import settings
from django.core.urlresolvers import reverse

from model_mommy import mommy

from accounting.models import Currency
from person.models import Person, PersonStatus, Role
from contact.models import PhoneNumberType, AddressType
from location.models import LocationLevel, LocationStatus
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


class LoginTests(TestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()

    def test_login_unauthenticated(self):
        response = self.client.get(reverse('login'))
        self.assertEqual(response.status_code, 200)

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
        self.client.login(username=self.person.username, password=self.password)

    def tearDown(self):
        self.client.logout()

    def test_get(self):
        response = self.client.get(reverse('index'))
        self.assertEqual(response.status_code, 200)

    def test_phone_number_types(self):
        response = self.client.get(reverse('index'))
        configuration = json.loads(response.context['phone_number_types_config'])
        self.assertTrue(len(configuration) > 0)
        # the model id shows in the context
        self.assertIn(str(self.phone_number_types.id), [c.values()[0] for c in configuration])
        self.assertIn(str(self.phone_number_types.name), [c.values()[1] for c in configuration])

    def test_address_types(self):
        mommy.make(AddressType)
        response = self.client.get(reverse('index'))
        configuration = json.loads(response.context['address_types'])
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
        self.assertIn(str(self.person_status.id), [c.values()[0] for c in configuration])
        self.assertIn(str(self.person_status.name), [c.values()[1] for c in configuration])

    def test_location_level(self):
        response = self.client.get(reverse('index'))
        configuration = json.loads(response.context['location_level_config'])
        self.assertTrue(len(configuration) > 0)
        # the model id shows in the context
        self.assertIn(str(self.location_levels.id), [c.values()[0] for c in configuration])
        self.assertIn(str(self.location_levels.name), [c.values()[1] for c in configuration])

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
