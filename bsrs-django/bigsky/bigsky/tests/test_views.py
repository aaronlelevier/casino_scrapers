import json
import uuid

from django.test import TestCase, LiveServerTestCase, TransactionTestCase
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse

from model_mommy import mommy

from person.models import Person, PersonStatus, Role
from contact.models import PhoneNumberType
from person.tests.factory import PASSWORD, create_person, create_role


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
        self.assertRedirects(response, reverse('login'))


class ConfigurationTests(TestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        self.phone_number_types = mommy.make(PhoneNumberType)
        self.person_status = mommy.make(PersonStatus)
        self.client.login(username=self.person.username, password=self.password)

    def tearDown(self):
        self.client.logout()

    def test_get(self):
        response = self.client.get(reverse('index'))
        self.assertEqual(response.status_code, 200)

    def test_phone_number_types(self):
        response = self.client.get(reverse('index'))
        self.assertTrue(response.context['phone_number_types_config'])

    def test_roles(self):
        response = self.client.get(reverse('index'))
        self.assertTrue(response.context['role_config'])

    def test_person_statuses(self):
        response = self.client.get(reverse('index'))
        self.assertTrue(response.context['person_status_config'])
