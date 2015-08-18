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
        # Currency Obj
        self.currency = Currency.objects.first()
        serializer = CurrencySerializer(self.currency)
        self.data = serializer.data

    def tearDown(self):
        self.client.logout()

    def test_list(self):
        response = self.client.get('/api/admin/currencies/')
        self.assertEqual(response.status_code, 200)
        # Content
        data = json.loads(response.content)
        self.assertTrue(data['results'] > 0)

    def test_detail(self):
        response = self.client.get('/api/admin/currencies/{}/'.format(self.currency.id))
        self.assertEqual(response.status_code, 200)

    def test_create(self):
        self.data.update({
            'id': str(uuid.uuid4())
            })
        response = self.client.post('/api/admin/currencies/', self.data, format='json')
        self.assertEqual(response.status_code, 201)

    def test_create_duplicate(self):
        """
        Trying to Post a duplicate returns a 400 and not a 500 Server Error
        
        ``util.views.BaseModelViewSet.create`` overriden for this behavior.
        """
        response = self.client.post('/api/admin/currencies/', self.data, format='json')
        self.assertEqual(response.status_code, 400)
