from django.test import TestCase

from accounting.models import Currency


class CurrencyManagerTests(TestCase):

    def test_get_or_create_default(self):
        default = Currency.objects.default()
        default = Currency.objects.default()
        self.assertIsInstance(default, Currency)
        self.assertEqual(Currency.objects.count(), 1)


class CurrencyTests(TestCase):

    def setUp(self):
        self.default = Currency.objects.default()

    def test_to_dict(self):
        self.assertIsInstance(self.default.to_dict(), dict)
        self.assertIn('id', self.default.to_dict())

    def test_update_defaults(self):
        self.assertEqual(self.default.code, self.default.code.upper())
        self.assertIsNotNone(self.default.name_plural)
        self.assertIsNotNone(self.default.symbol_native)