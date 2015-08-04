from django.test import TestCase

from location.tests import factory
from location.models import (Location, LocationLevel, LocationStatus,
    LocationType)


class LocationLevelTests(TestCase):

    def test_create_location_levels(self):
        factory.create_location_levels()
        self.assertEqual(LocationLevel.objects.count(), 5)
        # Region
        region = LocationLevel.objects.get(name='region')
        self.assertEqual(region.children.count(), 2)