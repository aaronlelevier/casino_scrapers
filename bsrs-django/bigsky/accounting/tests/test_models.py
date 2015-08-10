from django.test import TestCase

from accounting.models import Currency


class CurrencyTests(TestCase):

    def test_get_or_create_default(self):
        default = Currency.objects.default()
        default = Currency.objects.default()
        self.assertIsInstance(default, Currency)
