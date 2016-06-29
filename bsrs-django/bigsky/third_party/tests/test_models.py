from django.test import TestCase

from third_party.models import ThirdParty, ThirdPartyStatus
from third_party.tests import factory
from utils.models import DefaultNameManager
from utils.tests.test_helpers import create_default


class ThirdPartyStatusTests(TestCase):

    def setUp(self):
        self.default_status = create_default(ThirdPartyStatus)

    def test_default(self):
        self.assertEqual(ThirdPartyStatus.objects.default(), self.default_status)

    def test_meta__verbose_name_plural(self):
        self.assertEqual(ThirdPartyStatus._meta.verbose_name_plural, 'Third party statuses')

    def test_manager(self):
        self.assertIsInstance(ThirdPartyStatus.objects, DefaultNameManager)


class ThirdPartyTests(TestCase):

    def setUp(self):
        create_default(ThirdPartyStatus)
        self.third_party = factory.create_third_party()

    def test_model(self):
        self.assertIsInstance(self.third_party, ThirdParty)
        self.assertIsNotNone(self.third_party.number)

    def test_no_contact_models(self):
        [x.delete(override=True) for x in self.third_party.addresses.all()]
        self.assertFalse(self.third_party.addresses.all())
