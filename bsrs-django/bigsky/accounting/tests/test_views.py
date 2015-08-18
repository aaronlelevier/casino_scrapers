import json
import uuid

from rest_framework.test import APITestCase

from accounting.models import Currency
from accounting.serializers import CurrencySerializer
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
        data = json.loads(response.content)
        self.assertTrue(data['results'] > 0)

    def test_create(self):
        # TODO
        pass

    def test_create_duplicate(self):
        # Setup
        self.currency = Currency.objects.first()
        self.assertIsInstance(self.currency, Currency)

        serializer = CurrencySerializer(self.currency)
        self.data = serializer.data
        self.data.update({
            'id': str(uuid.uuid4())
            })
        # Test
        response = self.client.post('/api/admin/currencies/', self.data, format='json')
        # print response
        self.assertEqual(response.status_code, 201)
