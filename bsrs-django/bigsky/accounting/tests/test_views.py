import json
import uuid

from rest_framework.test import APITestCase

from accounting.models import Currency
from accounting.serializers import CurrencySerializer
from person.tests.factory import create_person, PASSWORD


class CurrencyTests(APITestCase):

    def setUp(self):
        self.person = create_person()
        # Currency Obj
        self.currency = Currency.objects.first()
        serializer = CurrencySerializer(self.currency)
        self.data = serializer.data
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_list(self):
        response = self.client.get('/api/admin/currencies/')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(Currency.objects.count(), 1)
        currency = data['results'][0]
        self.assertEqual(currency['id'], str(self.currency.id))
        self.assertEqual(currency['name'], self.currency.name)
        self.assertEqual(currency['name_plural'], self.currency.name_plural)
        self.assertEqual(currency['code'], self.currency.code)
        self.assertEqual(currency['symbol'], self.currency.symbol)
        self.assertEqual(currency['symbol_native'], self.currency.symbol_native)
        self.assertEqual(currency['decimal_digits'], self.currency.decimal_digits)
        self.assertEqual(currency['rounding'], self.currency.rounding)

    def test_detail(self):
        response = self.client.get('/api/admin/currencies/{}/'.format(self.currency.id))
        
        self.assertEqual(response.status_code, 200)
        currency = json.loads(response.content.decode('utf8'))
        self.assertEqual(Currency.objects.count(), 1)
        self.assertEqual(currency['id'], str(self.currency.id))
        self.assertEqual(currency['name'], self.currency.name)
        self.assertEqual(currency['name_plural'], self.currency.name_plural)
        self.assertEqual(currency['code'], self.currency.code)
        self.assertEqual(currency['symbol'], self.currency.symbol)
        self.assertEqual(currency['symbol_native'], self.currency.symbol_native)
        self.assertEqual(currency['decimal_digits'], self.currency.decimal_digits)
        self.assertEqual(currency['rounding'], self.currency.rounding)

    def test_create(self):
        code = 'jpy'
        self.data.update({
            'id': str(uuid.uuid4()),
            'code': code
            })

        response = self.client.post('/api/admin/currencies/', self.data, format='json')

        self.assertEqual(response.status_code, 201)
        currency = json.loads(response.content.decode('utf8'))
        self.assertEqual(Currency.objects.count(), 2)
        self.currency = Currency.objects.get(id=currency['id'])

        self.assertEqual(currency['id'], str(self.currency.id))
        self.assertEqual(currency['name'], self.currency.name)
        self.assertEqual(currency['name_plural'], self.currency.name_plural)
        self.assertEqual(currency['code'], code.upper())
        self.assertEqual(currency['symbol'], self.currency.symbol)
        self.assertEqual(currency['symbol_native'], self.currency.symbol_native)
        self.assertEqual(currency['decimal_digits'], self.currency.decimal_digits)
        self.assertEqual(currency['rounding'], self.currency.rounding)
