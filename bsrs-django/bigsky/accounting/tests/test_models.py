from django.test import TestCase
from django.utils.text import capfirst

from accounting.models import Currency, CurrencyManager, DEFAULT_CURRENCY


class CurrencyManagerTests(TestCase):

    def setUp(self):
        self.default = Currency.objects.default()

    def test_default__get_or_create(self):
        self.assertEqual(Currency.objects.count(), 1)

        default = Currency.objects.default()

        self.assertIsInstance(default, Currency)
        self.assertEqual(Currency.objects.count(), 1)

    def test_default__properties(self):
        self.assertEqual(self.default.name, DEFAULT_CURRENCY['name'])
        self.assertEqual(self.default.code, DEFAULT_CURRENCY['code'])
        self.assertEqual(self.default.symbol, DEFAULT_CURRENCY['symbol'])
        self.assertEqual(self.default.decimal_digits, DEFAULT_CURRENCY['decimal_digits'])
        self.assertEqual(self.default.rounding, DEFAULT_CURRENCY['rounding'])


class CurrencyTests(TestCase):

    def setUp(self):
        self.default = Currency.objects.default()

    def test_manager(self):
        self.assertIsInstance(Currency.objects, CurrencyManager)

    def test_meta__verbose_name_plural(self):
        self.assertEqual(Currency._meta.verbose_name_plural, "Currencies")

    def test_str(self):
        self.assertEqual(self.default.name, str(self.default))

    def test_update_defaults__name_plural(self):
        self.default.name_plural = None

        self.default.save()

        self.assertEqual(self.default.name_plural, capfirst(self.default.name+'s'))

    def test_update_defaults__symbol_native(self):
        self.default.symbol_native = None

        self.default.save()

        self.assertEqual(self.default.symbol_native, self.default.symbol)

    def test_to_dict(self):
        data = self.default.to_dict()

        self.assertIsInstance(self.default.to_dict(), dict)
        self.assertEqual(data['id'], str(self.default.id))
        self.assertEqual(data['name'], self.default.name)
        self.assertEqual(data['name_plural'], self.default.name_plural)
        self.assertEqual(data['code'], self.default.code)
        self.assertEqual(data['symbol'], self.default.symbol)
        self.assertEqual(data['symbol_native'], self.default.symbol_native)
        self.assertEqual(data['decimal_digits'], self.default.decimal_digits)
        self.assertEqual(data['rounding'], self.default.rounding)
