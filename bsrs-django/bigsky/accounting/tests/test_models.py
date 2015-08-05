from django.test import TestCase

from accounting.models import Currency, AuthAmount


class CurrencyManagerTests(TestCase):

    def test_default(self):
        default = Currency.objects.default()
        self.assertIsInstance(default, Currency)