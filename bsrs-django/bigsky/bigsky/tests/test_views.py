import json

from django.test import TestCase, LiveServerTestCase
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse

from model_mommy import mommy
from selenium import webdriver
from selenium.webdriver.common.keys import Keys

from person.models import Person
from contact.models import PhoneNumberType
from person.tests.factory import PASSWORD, create_person


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

    def test_should_add_phone_number_type_configuration_to_the_index_html(self):
        office_phone_pk = 1
        office_phone_name = 'admin.phonenumbertype.office'
        mobile_phone_pk = 5
        mobile_phone_name = 'admin.phonenumbertype.mobile'
        PhoneNumberType.objects.create(pk=office_phone_pk, name=office_phone_name)
        PhoneNumberType.objects.create(pk=mobile_phone_pk, name=mobile_phone_name)
        self.client.login(username=self.person.username, password=self.password)
        response = self.client.get(reverse('index'))
        self.assertEqual(response.status_code, 200)
        configuration = json.loads(response.context['phone_number_types_config'])
        self.assertEqual(2, len(configuration))
        self.assertEqual(configuration[0]['id'], mobile_phone_pk)
        self.assertEqual(configuration[0]['name'], mobile_phone_name)
        self.assertEqual(configuration[1]['id'], office_phone_pk)
        self.assertEqual(configuration[1]['name'], office_phone_name)
