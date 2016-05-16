from collections import namedtuple

from django.test import TestCase

from accounting.models import Currency
from accounting.tests import factory


class FactoryTests(TestCase):

    def setUp(self):
        factory.create_currencies()

    def test_create_currencies(self):
        for c in factory.CURRENCIES:
            CurrencyData = namedtuple('CurrencyData',
                                      ['name', 'name_plural', 'code',
                                       'symbol', 'symbol_native', 'decimal_digits'])
            data = CurrencyData._make(c)._asdict()
            self.assertTrue(Currency.objects.filter(code=data['code']).exists())

    def test_generate_uuid(self):
        for index, currency in enumerate(Currency.objects.order_by('id')):
            self.assertEqual(str(currency.id)[-3:], "{:03d}".format(index+1))
