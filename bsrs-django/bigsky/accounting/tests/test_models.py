from django.test import TestCase

from model_mommy import mommy

from accounting.models import Currency, CurrencyManager, DEFAULT_CURRENCY


class CurrencyManagerTests(TestCase):

    def setUp(self):
        self.default = Currency.objects.default()

    def test_get_or_create_default(self):
        default = Currency.objects.default()

        self.assertIsInstance(default, Currency)
        self.assertEqual(Currency.objects.count(), 1)

    def test_default_name(self):
        self.assertEqual(self.default.name, DEFAULT_CURRENCY['name'])

    def test_default_code(self):
        self.assertEqual(self.default.code, DEFAULT_CURRENCY['code'])

    def test_default_symbol(self):
        self.assertEqual(self.default.symbol, DEFAULT_CURRENCY['symbol'])

    def test_default_decimal_digits(self):
        self.assertEqual(self.default.decimal_digits, DEFAULT_CURRENCY['decimal_digits'])

    def test_default_rounding(self):
        self.assertEqual(self.default.rounding, DEFAULT_CURRENCY['rounding'])


class CurrencyTests(TestCase):

    def setUp(self):
        self.default = Currency.objects.default()

    def test_manager(self):
        self.assertIsInstance(Currency.objects, CurrencyManager)

    def test_verbose_name_plural(self):
        self.assertEqual(Currency._meta.verbose_name_plural, "Currencies")

    def test_update_defaults(self):
        self.assertEqual(self.default.code, self.default.code.upper())
        self.assertIsNotNone(self.default.name_plural)
        self.assertIsNotNone(self.default.symbol_native)

    def test_to_dict(self):
        self.assertIsInstance(self.default.to_dict(), dict)
        self.assertIn('id', self.default.to_dict())
