from django.conf import settings
from django.test import TestCase

from location.tests import factory
from location.models import Location, LocationLevel


class LocationLevelTests(TestCase):

    def setUp(self):
        factory.create_location_levels()

    def test_create_location_levels(self):
        self.assertEqual(LocationLevel.objects.count(), 6)

    def test_region_count(self):
        region = LocationLevel.objects.get(name='region')

        self.assertEqual(region.children.count(), 2)

    def test_default(self):
        default = LocationLevel.objects.get(name=settings.DEFAULT_LOCATION_LEVEL)

        self.assertIsInstance(default, LocationLevel)

    def test_location_level(self):
        ret = factory.create_location_level()

        self.assertIsInstance(ret, LocationLevel)


class LocationTests(TestCase):

    def test_create_locations(self):
        factory.create_locations()
        # District
        ca = Location.objects.get(name='ca')
        self.assertEqual(ca.parents.count(), 1)

    def test_create_location(self):
        ret = factory.create_location()

        self.assertIsInstance(ret, Location)

    def test_create_location__with_specific_location_level(self):
        factory.create_location_levels()
        location_level = LocationLevel.objects.order_by("?")[0]

        ret = factory.create_location(location_level)

        self.assertIsInstance(ret, Location)
        self.assertEqual(ret.location_level, location_level)
