from django.test import TestCase

from accounting.models import Currency, AuthAmount


class CurrencyTests(TestCase):

    def test_default(self):
        default = Currency.objects.default()
        self.assertIsInstance(default, Currency)


class AuthAmountTests(TestCase):

    def test_default(self):
        default = AuthAmount.objects.default()
        self.assertIsInstance(default, AuthAmount)
        self.assertEqual(default.currency, Currency.objects.default())