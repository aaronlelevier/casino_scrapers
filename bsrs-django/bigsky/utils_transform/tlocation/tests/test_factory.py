from django.test import TestCase

from utils_transform.tlocation.models import (LocationRegion, LocationDistrict,
    LocationStore)
from utils_transform.tlocation.tests import factory


class FactoryTests(TestCase):

    def test_create_location_region(self):
        ret = factory.create_location_region()

        self.assertIsInstance(ret, LocationRegion)
        for field in factory.DOMINO_LOCATION_FIELDS:
            self.assertTrue(getattr(ret, field))

    def test_create_location_district(self):
        ret = factory.create_location_district()

        self.assertIsInstance(ret, LocationDistrict)
        for field in factory.DOMINO_LOCATION_FIELDS:
            self.assertTrue(getattr(ret, field))

    def test_create_location_district__no_region(self):
        ret = factory.create_location_district()

        self.assertFalse(ret.regionnumber)

    def test_create_location_district__has_region(self):
        region = factory.create_location_region()

        district = factory.create_location_district(region)

        self.assertEqual(district.regionnumber, region.number)

    def test_create_location_store(self):
        ret = factory.create_location_store()

        self.assertIsInstance(ret, LocationStore)
        for field in factory.DOMINO_LOCATION_FIELDS:
            self.assertTrue(getattr(ret, field))

    def test_create_location_store__no_district(self):
        ret = factory.create_location_store()

        self.assertFalse(ret.distnumber)

    def test_create_location_store__has_district(self):
        district = factory.create_location_district()

        store = factory.create_location_store(district)

        self.assertEqual(store.distnumber, district.number)
