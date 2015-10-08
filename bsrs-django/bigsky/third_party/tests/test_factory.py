from django.test import TestCase

from third_party.tests import factory
from third_party.models import ThirdParty


class ThirdPartyTests(TestCase):

    def test_create_third_parties(self):
        factory.create_third_parties()
        contractor = ThirdParty.objects.filter(name='ABC_CONTRACTOR')
        self.assertEqual(contractor.count(), 1)

