from django.test import TestCase
from django.conf import settings

from third_party.models import ThirdParty, ThirdPartyStatus
from third_party.tests import factory


class ThirdPartyStatusManagerTests(TestCase):

    def test_default(self):
        default = ThirdPartyStatus.objects.default()
        self.assertIsInstance(default, ThirdPartyStatus)
        self.assertEqual(default.name, settings.THIRD_PARTY_STATUS_DEFAULT)


class ThirdPartyTests(TestCase):

    def setUp(self):
        self.third_party = factory.create_third_party()

    def test_model(self):
        self.assertIsInstance(self.third_party, ThirdParty)
        self.assertIsNotNone(self.third_party.number)

    def test_no_contact_models(self):
        [x.delete(override=True) for x in self.third_party.addresses.all()]
        self.assertFalse(self.third_party.addresses.all())