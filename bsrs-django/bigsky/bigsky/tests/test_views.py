import json
import uuid

from django.test import TestCase, LiveServerTestCase, TransactionTestCase
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse

from model_mommy import mommy
from selenium import webdriver
from selenium.webdriver.common.keys import Keys

from person.models import Person, PersonStatus
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


class SeleniumTests(LiveServerTestCase):

    def setUp(self):
        self.browser = webdriver.Firefox()

    def tearDown(self):
        self.browser.quit()

    def test_login(self):
        self.browser.get('http://localhost:8001/login/')
        #self.assertIn('Login', self.browser.title) WIP!toranb


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
        configuration = json.loads(response.context['phone_number_types_config'])
        self.assertTrue(len(configuration) > 0)
        # the model id shows in the context
        self.assertIn(str(self.phone_number_types.id), [c.values()[0] for c in configuration])

    def test_roles(self):
        response = self.client.get(reverse('index'))
        configuration = json.loads(response.context['role_config'])
        self.assertTrue(len(configuration) > 0)
        # the model id shows in the context
        self.assertIn(str(self.person.role.id), [c.values()[0] for c in configuration])

    def test_person_statuses(self):
        response = self.client.get(reverse('index'))
        configuration = json.loads(response.context['person_status_config'])
        self.assertTrue(len(configuration) > 0)
        # the model id shows in the context
        self.assertIn(str(self.person_status.id), [c.values()[0] for c in configuration])
