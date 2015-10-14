from django.test import TestCase

from accounting.models import Currency
from category.models import Category
from contact.models import PhoneNumber, Email, Address
from third_party.tests import factory
from third_party.models import ThirdParty, ThirdPartyStatus


class CreateThirdPartyTests(TestCase):

    def setUp(self):
        self.third_party = factory.create_third_party()

    def test_create(self):
        self.assertIsInstance(self.third_party, ThirdParty)
        self.assertEqual(ThirdParty.objects.count(), 1)

    def test_status(self):
        self.assertIsInstance(self.third_party.status, ThirdPartyStatus)

    def test_name(self):
        self.assertTrue(self.third_party.name)

    def test_number(self):
        self.assertTrue(self.third_party.number)

    def test_currency(self):
        self.assertIsInstance(self.third_party.currency, Currency)

    def test_categories(self):
        self.assertEqual(self.third_party.categories.count(), 2)

    def test_emails(self):
        self.assertEqual(self.third_party.emails.count(), 1)

    def test_phone_number(self):
        self.assertEqual(self.third_party.phone_numbers.count(), 1)

    def test_addresses(self):
        self.assertEqual(self.third_party.addresses.count(), 1)