import json

from rest_framework.test import APITestCase

from accounting.models import Currency, AuthAmount
from person.tests.factory import create_person, PASSWORD


class CurrencyTests(APITestCase):

    def setUp(self):
        self.person = create_person()
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_response(self):
        response = self.client.get('/api/admin/currencies/')
        self.assertEqual(response.status_code, 200)
        # Content
        data = json.loads(response.content.decode('utf8'))
        self.assertTrue(len(data['results']) > 0)


class AuthAmountTests(APITestCase):

    def setUp(self):
        self.person = create_person()
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_response(self):
        response = self.client.get('/api/admin/auth_amounts/')
        self.assertEqual(response.status_code, 200)
        # Content
        data = json.loads(response.content.decode('utf8'))
        self.assertTrue(len(data['results']) > 0)