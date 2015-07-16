from django.test import TestCase, LiveServerTestCase
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse

from model_mommy import mommy
from selenium import webdriver
from selenium.webdriver.common.keys import Keys

from person.models import Person
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
