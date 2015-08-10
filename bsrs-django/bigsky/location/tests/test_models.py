from django.db import models
from django.conf import settings
from django.test import TestCase

from model_mommy import mommy

from location.tests.factory import create_locations
from location.models import LocationLevel, LocationStatus, LocationType, Location


class SelfRefrencingManagerTests(TestCase):
    '''
    ``LocationLevel`` Model used for testing of: ``SelfRefrencingManager``
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


class LocationLevelManagerTests(TestCase):
    '''
    Test default M2M Manager methods which don't traverse relationships.
    '''
    def setUp(self):
        self.region = mommy.make(LocationLevel, name='region')
        self.district = mommy.make(LocationLevel, name='district')
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


class LocationLevelTests(TestCase):

    def setUp(self):
        self.location = mommy.make(Location)

    def test_name(self):
        # confirm that the "mixin-inheritance" worked for the ``name`` field
        self.assertTrue(hasattr(self.location, 'name'))


class LocationStatusManagerTests(TestCase):

    def test_default(self):
        d = LocationStatus.objects.default()
        self.assertIsInstance(d, LocationStatus)
        self.assertEqual(d.name, settings.DEFAULT_LOCATION_STATUS)


class LocationManagerTests(TestCase):

    def setUp(self):
        create_locations()
        # Parent Location
        self.location = Location.objects.get(name='east')
        # Child LocationLevel
        self.location_level = LocationLevel.objects.get(name='store')

    def test_get_level_children(self):
        children = Location.objects.get_level_children(self.location, self.location_level.id)
        self.assertEqual(children.count(), 2)


class LocationTests(TestCase):

    def test_joins_n_create(self):
        l = mommy.make(Location)
        self.assertIsInstance(l, Location)
        self.assertIsInstance(l.location_level, LocationLevel)
        self.assertIsInstance(l.status, LocationStatus)
        self.assertIsInstance(l.type, LocationType)


