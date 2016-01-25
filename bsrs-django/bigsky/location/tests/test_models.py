from django.db import models
from django.conf import settings
from django.test import TestCase

from model_mommy import mommy

from location.tests.factory import create_locations
from location.models import LocationLevel, LocationStatus, LocationType, Location
from person.tests.factory import create_single_person


class SelfReferencingManagerTests(TestCase):
    '''
    ``LocationLevel`` Model used for testing of: ``SelfReferencingManager``
    '''

    def setUp(self):
        self.region = mommy.make(LocationLevel, name='region')
        self.district = mommy.make(LocationLevel, name='district')
        self.store1 = mommy.make(LocationLevel, name='store1')
        self.store2 = mommy.make(LocationLevel, name='store2')
        self.store3 = mommy.make(LocationLevel, name='wat')

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

    def test_delete_child(self):
        district_children = self.district.children.all()
        init_count = district_children.count()
        # Child
        first_child = district_children.first()
        first_child.delete()
        self.assertIsNotNone(first_child.deleted)
        # M2M test
        self.assertEqual(
            self.district.children.count(),
            init_count-1
        )


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

    def test_create_top_level(self):
        ret = LocationLevel.objects.create_top_level()
        self.assertIsInstance(ret, LocationLevel)
        self.assertEqual(ret.name, settings.LOCATION_TOP_LEVEL_NAME)


class LocationLevelTests(TestCase):

    def setUp(self):
        self.location = mommy.make(Location)

    def test_name(self):
        # confirm that the "mixin-inheritance" worked for the ``name`` field
        self.assertTrue(hasattr(self.location, 'name'))

    def test_to_dict(self):
        # middle
        location_level = mommy.make(LocationLevel)
        # child
        location_level_two = mommy.make(LocationLevel)
        # parent
        location_level_three = mommy.make(LocationLevel, children=[location_level])
        location_level.children.add(location_level_two)
        location_level.parents.add(location_level_three)
        self.assertIsInstance(location_level.children.first(), LocationLevel)
        self.assertIsInstance(location_level.parents.first(), LocationLevel)
        self.assertEqual(location_level.parents.first().children.first().pk, location_level.pk)


class LocationStatusManagerTests(TestCase):

    def test_default(self):
        d = LocationStatus.objects.default()
        self.assertIsInstance(d, LocationStatus)
        self.assertEqual(d.name, settings.DEFAULT_LOCATION_STATUS)


class LocationManagerTests(TestCase):

    def setUp(self):
        create_locations()

    def test_get_level_children(self):
        # setup
        location = Location.objects.get(name='ca')
        # test
        children = Location.objects.get_level_children(location, location.location_level.id)
        self.assertEqual(children.count(), 3)

    def test_get_level_parents(self):
        # 'ca' is a 'district' that now has 3 parents at the 'region'(2) and Company(1) ``LocationLevel``
        # setup
        location = Location.objects.get(name='ca')
        location_level = LocationLevel.objects.get(name='region')
        # New Parent Location at "region" Level
        east_lp = mommy.make(Location, location_level=location_level, name='east_lp')
        east_lp.children.add(location)
        # Test
        parents = Location.objects.get_level_parents(location, location.location_level.id)
        self.assertEqual(parents.count(), 3)

    def test_objects_and_their_children(self):
        person = create_single_person()
        [person.locations.remove(x) for x in person.locations.all()]
        east = Location.objects.get(name='east')
        person.locations.add(east)
        self.assertEqual(person.locations.count(), 1)
        self.assertEqual(person.locations.first().children.count(), 2)
        ret = person.locations.objects_and_their_children()
        self.assertEqual(len(ret), 5)
        self.assertIn(person.locations.first().id, ret)

    def test_objects_and_their_children__top_level(self):
        # All Locations should be returned if the 'person' has the 'top level location'
        person = create_single_person()
        [person.locations.remove(x) for x in person.locations.all()]
        company = Location.objects.create_top_level()
        person.locations.add(company)

        ret = person.locations.objects_and_their_children()

        self.assertEqual(len(ret), Location.objects.count())

    def test_create_top_level(self):
        ret = Location.objects.create_top_level()
        self.assertIsInstance(ret, Location)
        self.assertEqual(ret.name, settings.LOCATION_TOP_LEVEL_NAME)
        self.assertEqual(ret.location_level.name, settings.LOCATION_TOP_LEVEL_NAME)


class LocationTests(TestCase):

    def test_joins_n_create(self):
        l = mommy.make(Location)
        self.assertIsInstance(l, Location)
        self.assertIsInstance(l.location_level, LocationLevel)
        self.assertIsInstance(l.status, LocationStatus)
        self.assertIsInstance(l.type, LocationType)
