from django.test import TestCase
from django.utils.text import capfirst

from accounting.models import Currency, CurrencyManager, DEFAULT_CURRENCY


class CurrencyTestSetupMixin(object):

    def setUp(self):
        self.currency = Currency.objects.default()


class CurrencyManagerTests(CurrencyTestSetupMixin, TestCase):

    def test_default__get_or_create(self):
        self.assertEqual(Currency.objects.count(), 1)

        default = Currency.objects.default()

        self.assertIsInstance(default, Currency)
        self.assertEqual(Currency.objects.count(), 1)

    def test_default__properties(self):
        self.assertEqual(self.currency.name, DEFAULT_CURRENCY['name'])
        self.assertEqual(self.currency.code, DEFAULT_CURRENCY['code'])
        self.assertEqual(self.currency.symbol, DEFAULT_CURRENCY['symbol'])
        self.assertEqual(self.currency.decimal_digits, DEFAULT_CURRENCY['decimal_digits'])
        self.assertEqual(self.currency.rounding, DEFAULT_CURRENCY['rounding'])


class CurrencyTests(CurrencyTestSetupMixin, TestCase):

    def test_manager(self):
        self.assertIsInstance(Currency.objects, CurrencyManager)

    def test_meta__verbose_name_plural(self):
        self.assertEqual(Currency._meta.verbose_name_plural, "Currencies")

    def test_str(self):
        self.assertEqual(self.currency.name, str(self.currency))

    def test_update_defaults(self):
        self.currency.name_plural = None
        self.currency.symbol_native = None

        self.currency._update_defaults()

        self.assertEqual(self.currency.name_plural, capfirst(self.currency.name+'s'))
        self.assertEqual(self.currency.symbol_native, self.currency.symbol)

    def test_to_dict(self):
        data = self.currency.to_dict()

        self.assertIsInstance(self.currency.to_dict(), dict)
        self.assertEqual(data['id'], str(self.currency.id))
        self.assertEqual(data['name'], self.currency.name)
        self.assertEqual(data['name_plural'], self.currency.name_plural)
        self.assertEqual(data['code'], self.currency.code)
        self.assertEqual(data['symbol'], self.currency.symbol)
        self.assertEqual(data['symbol_native'], self.currency.symbol_native)
        self.assertEqual(data['decimal_digits'], self.currency.decimal_digits)
        self.assertEqual(data['rounding'], self.currency.rounding)
