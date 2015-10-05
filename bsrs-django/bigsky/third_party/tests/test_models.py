from django.test import TestCase
from django.conf import settings

from third_party.models import ThirdParty, ThirdPartyStatus
from third_party.tests import factory


class ContractorTests(TestCase):

    def setUp(self):
        factory.create_third_party()

    def test_model(self):
        third_party = ThirdParty.objects.first()
        self.assertIsInstance(third_party, ThirdParty)

class ContractorStatusManagerTests(TestCase):

    def test_default(self):
        default = ThirdPartyStatus.objects.default()
        self.assertIsInstance(default, ThirdPartyStatus)

