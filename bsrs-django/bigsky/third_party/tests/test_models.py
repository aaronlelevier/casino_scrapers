from django.test import TestCase

from third_party.models import ThirdParty, ThirdPartyStatus
from third_party.tests import factory


class ThirdPartyTests(TestCase):

    def setUp(self):
        factory.create_third_parties()

    def test_model(self):
        third_party = ThirdParty.objects.first()
        self.assertIsInstance(third_party, ThirdParty)
        self.assertIsNotNone(third_party.number)

class ThirdPartyStatusManagerTests(TestCase):

    def test_default(self):
        default = ThirdPartyStatus.objects.default()
        self.assertIsInstance(default, ThirdPartyStatus)
        self.assertIsNotNone(default.name)

