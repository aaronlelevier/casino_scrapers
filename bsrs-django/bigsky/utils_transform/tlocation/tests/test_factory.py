from django.test import TestCase

from utils_transform.tlocation.models import LocationRegion, LocationDistrict
from utils_transform.tlocation.tests import factory


class FactoryTests(TestCase):

    def test_create_location_region(self):
        ret = factory.create_location_region()

        self.assertIsInstance(ret, LocationRegion)
        for field in factory.FACTORY_LOCATION_REGION_FIELDS:
            self.assertTrue(getattr(ret, field))

    def test_create_location_district(self):
        """
        TODO: doesn't have a Parent Region yet, even though 
        ``regionnumber`` attr is populated!!
        """
        ret = factory.create_location_district()

        self.assertIsInstance(ret, LocationDistrict)
        for field in factory.FACTORY_LOCATION_REGION_FIELDS:
            self.assertTrue(getattr(ret, field))

    def test_create_location_district__no_region(self):
        ret = factory.create_location_district()

        self.assertFalse(ret.regionnumber)

    def test_create_location_district__has_region(self):
        region = factory.create_location_region()

        district = factory.create_location_district(region)

        self.assertEqual(district.regionnumber, region.number)

