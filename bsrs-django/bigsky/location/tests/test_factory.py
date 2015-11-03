from django.test import TestCase

from location.tests import factory
from location.models import Location, LocationLevel


class LocationLevelTests(TestCase):

    def test_create_location_levels(self):
        factory.create_location_levels()
        self.assertEqual(LocationLevel.objects.count(), 5)
        # Region
        region = LocationLevel.objects.get(name='region')
        self.assertEqual(region.children.count(), 2)


class LocationTests(TestCase):

    def test_create_locations(self):
        factory.create_locations()
        # District
        ca = Location.objects.get(name='ca')
        self.assertEqual(ca.parents.count(), 1)
