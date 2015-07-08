from django.test import TestCase

from model_mommy import mommy

from location.models import (LocationLevel, LocationStatus,
    LocationType, Location)


class LocationLevelTests(TestCase):

    def test_children(self):
        district = mommy.make(LocationLevel, name='district')
        region = mommy.make(LocationLevel, name='region')

        # no children levels
        self.assertEqual(region.children.count(), 0)

        # add a child level
        region.children.add(district)
        self.assertEqual(region.children.count(), 1)


class LocationTests(TestCase):

    def test_joins_n_create(self):
        l = mommy.make(Location)
        self.assertIsInstance(l, Location)
        self.assertIsInstance(l.level, LocationLevel)