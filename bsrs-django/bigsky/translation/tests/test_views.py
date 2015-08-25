import json

from rest_framework.test import APITestCase

from person.tests.factory import create_person, PASSWORD
from translation.models import Locale, Definition
from translation.tests.factory import create_locales, create_definitions


class LocaleTests(APITestCase):

    def setUp(self):
        create_locales()
        # Login
        self.person = create_person()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_get(self):
        response = self.client.get('/api/admin/locales/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['count'], Locale.objects.count())


class DefinitionTests(APITestCase):

    def setUp(self):
        create_definitions()
        # Login
        self.person = create_person()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_get(self):
        response = self.client.get('/api/admin/definitions/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['count'], Definition.objects.count())

