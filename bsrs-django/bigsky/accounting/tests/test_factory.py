from collections import namedtuple

from django.test import TestCase

from accounting.models import Currency
from accounting.tests import factory


class FactoryTests(TestCase):

    def setUp(self):
        factory.create_currencies()

    def test_create_currency(self):
        ret = factory.create_currency()

        self.assertIsInstance(ret, Currency)
        self.assertEqual(ret.code, 'USD')

    def test_create_currency__code(self):
        code = 'CNY'

        ret = factory.create_currency(code=code)

        self.assertIsInstance(ret, Currency)
        self.assertEqual(ret.code, code)

    def test_create_currency__invalid_code(self):
        code = 'foo'
        self.assertNotIn(code, [x[2] for x in factory.CURRENCIES])

        with self.assertRaises(IndexError):
            ret = factory.create_currency(code=code)

    def test_create_currencies(self):
        for c in factory.CURRENCIES:
            data = factory.CurrencyData._make(c)._asdict()
            self.assertTrue(Currency.objects.filter(code=data['code']).exists())

    def test_generate_uuid(self):
        for index, currency in enumerate(Currency.objects.order_by('id')):
            self.assertEqual(str(currency.id)[-3:], "{:03d}".format(index+1))

    def test_get_or_create_currency(self):
        data = factory.CurrencyData._make(factory.CURRENCIES[0])._asdict()

        ret = factory.get_or_create_currency(**data)

        self.assertIsInstance(ret, Currency)