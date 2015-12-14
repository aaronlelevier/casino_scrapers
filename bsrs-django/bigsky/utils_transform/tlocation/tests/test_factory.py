from django.test import TestCase

from model_mommy import mommy

from utils_transform.tlocation.models import LocationRegion, LocationDistrict, LocationStore
from utils_transform.tlocation.tests import factory


class FactoryTests(TestCase):

    def test_create_location_region(self):
        ret = factory.create_location_region()

        self.assertIsInstance(ret, LocationRegion)
        for field in factory.FACTORY_LOCATION_REGION_FIELDS:
            self.assertTrue(getattr(ret, field))
