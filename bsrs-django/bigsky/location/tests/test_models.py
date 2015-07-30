from django.db import models
from django.test import TestCase

from model_mommy import mommy

from location.models import (LocationLevel, LocationStatus, LocationType,
    Location, DEFAULT_LOCATION_STATUS)


class LocationLevelManagerTests(TestCase):
    '''
    Traverse relationships tests.
    '''

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
    '''
    Test default M2M Manager methods which don't traverse relationships.
    '''
    def setUp(self):
        self.district = mommy.make(LocationLevel, name='district')
        self.region = mommy.make(LocationLevel, name='region')
        self.store1 = mommy.make(LocationLevel, name='store1')
        self.store2 = mommy.make(LocationLevel, name='store2')

    def test_children(self):
        # no children levels
        self.assertEqual(self.region.children.count(), 0)
        # Direct child increments
        self.region.children.add(self.district)
        self.assertEqual(self.region.children.count(), 1)
        # Indirect childrent do not increment
        self.district.children.add(self.store1)
        self.district.children.add(self.store2)
        self.assertEqual(self.region.children.count(), 1)

    def test_parents(self):
        self.assertEqual(self.store1.parents.count(), 0)
        # Direct parent increments
        self.region.children.add(self.district)
        self.assertEqual(self.district.parents.count(), 1)
        # Indirect parents do no increment
        self.district.children.add(self.store1)
        self.district.children.add(self.store2)
        self.assertEqual(self.district.parents.count(), 1)


class LocationStatusManagerTests(TestCase):

    def test_default(self):
        d = LocationStatus.objects.default()
        self.assertIsInstance(d, LocationStatus)
        self.assertEqual(d.name, DEFAULT_LOCATION_STATUS)


class LocationTests(TestCase):

    def test_joins_n_create(self):
        l = mommy.make(Location)
        self.assertIsInstance(l, Location)
        self.assertIsInstance(l.level, LocationLevel)
        self.assertIsInstance(l.status, LocationStatus)
        self.assertIsInstance(l.type, LocationType)