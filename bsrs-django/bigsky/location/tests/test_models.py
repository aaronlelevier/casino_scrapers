from django.db import models
from django.test import TestCase

from model_mommy import mommy

from location.models import (LocationLevel, LocationStatus,
    LocationType, Location)


class LocationLevelManagerTests(TestCase):

    def setUp(self):
        self.region = mommy.make(LocationLevel, name='region')
        self.district = mommy.make(LocationLevel, name='district')
        self.store1 = mommy.make(LocationLevel, name='store1')
        self.store2 = mommy.make(LocationLevel, name='store2')

        # test that ``get_all_children()`` traverses multiple levels, and
        # doesn't just get the ``children`` for a single ``LocationLevel``
        self.region.children.add(self.district)
        self.district.children.add(self.store1)
        self.district.children.add(self.store2)

    def test_get_all_children(self):
        # should have 3 children, now 1
        all_children = LocationLevel.objects.get_all_children(self.region)
        self.assertEqual(len(all_children), 3)
        self.assertIsInstance(all_children, models.query.QuerySet)

    def test_get_all_parents(self):
        # should have 2 parents, not 1
        all_parents = LocationLevel.objects.get_all_parents(self.store1)
        self.assertEqual(len(all_parents), 2)
        self.assertIsInstance(all_parents, models.query.QuerySet)


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