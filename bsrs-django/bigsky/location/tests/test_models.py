import uuid
from django.db import models
from django.conf import settings
from django.test import TestCase

from model_mommy import mommy

from location.models import (
    LocationManager, LocationLevel, LocationStatus, LocationType, Location,
    LOCATION_COMPANY, LOCATION_REGION, LOCATION_FMU, LOCATION_STORE,)
from location.tests.factory import create_location, create_locations
from person.tests.factory import create_single_person
from utils.models import DefaultNameManager
from utils.tests.test_helpers import create_default


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
        self.assertEqual(ret.name, settings.DEFAULT_LOCATION_LEVEL)


class LocationLevelTests(TestCase):

    def setUp(self):
        self.location = create_location()

    def test_name(self):
        # confirm that the "mixin-inheritance" worked for the ``name`` field
        self.assertTrue(hasattr(self.location, 'name'))

    def test_is_top_level(self):
        location_level, _ = LocationLevel.objects.get_or_create(name=LOCATION_COMPANY)
        self.assertTrue(location_level.is_top_level)

    def test_is_top_level__false(self):
        location_level = mommy.make(LocationLevel, name='foo')
        self.assertFalse(location_level.is_top_level)

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


class LocationStatusTests(TestCase):

    def setUp(self):
        self.default_status = create_default(LocationStatus)

    def test_default(self):
        self.assertEqual(LocationStatus.objects.default(), self.default_status)

    def test_manager(self):
        self.assertIsInstance(LocationStatus.objects, DefaultNameManager)

    def test_to_dict(self):
        ret = self.default_status.to_dict()

        self.assertEqual(ret["id"], str(self.default_status.id))
        self.assertEqual(ret["name"], self.default_status.name)
        self.assertEqual(ret["default"], True if self.default_status.name == self.default_status.default else False)


class LocationTypeTests(TestCase):

    def setUp(self):
        self.default_type = create_default(LocationType)

    def test_default(self):
        self.assertEqual(LocationType.objects.default(), self.default_type)

    def test_manager(self):
        self.assertIsInstance(LocationType.objects, DefaultNameManager)


class LocationManagerTests(TestCase):

    def setUp(self):
        create_locations()

    def test_get_level_children(self):
        # setup
        location = Location.objects.get(name='ca')
        # test
        children = Location.objects.get_level_children(location.location_level.id, location.id)
        self.assertEqual(children.count(), 2)

    def test_get_level_children_exclude(self):
        # setup
        location = Location.objects.get(name='ca')
        location_level_updated = LocationLevel.objects.get(name=settings.DEFAULT_LOCATION_LEVEL)
        # test
        children = Location.objects.get_level_children(location_level_updated.id, location.id)
        self.assertEqual(children.count(), 5)

    def test_get_level_children_exclude_not_relevant_pk(self):
        # setup
        location = Location.objects.get(name='ca')
        location_level_updated = LocationLevel.objects.get(name=settings.DEFAULT_LOCATION_LEVEL)
        # test
        children = Location.objects.get_level_children(location_level_updated.id, str(uuid.uuid4()))
        self.assertEqual(children.count(), 6)

    def test_get_level_parents(self):
        # 'ca' is a 'district' that now has 3 parents at the 'region'(2) and company(1) ``LocationLevel``
        # setup
        location = Location.objects.get(name='ca')
        location_level = LocationLevel.objects.get(name=LOCATION_REGION)
        # New Parent Location at "region" Level
        east_lp = mommy.make(Location, location_level=location_level, name='east_lp')
        east_lp.children.add(location)
        # Test
        parents = Location.objects.get_level_parents(location.location_level.id, location.id)
        self.assertEqual(parents.count(), 3)

    def test_get_level_parents_excludee(self):
        # user may change location level so need to make sure location is not passed down as parent
        # 'ca' is a 'district' that now has 3 parents at the 'region'(2) and company(1) ``LocationLevel``
        # setup
        location = Location.objects.get(name='ca')
        location_level = LocationLevel.objects.get(name=LOCATION_REGION)
        location_level_updated = LocationLevel.objects.get(name=LOCATION_STORE)
        # New Parent Location at "region" Level
        east_lp = mommy.make(Location, location_level=location_level, name='east_lp')
        east_lp.children.add(location)
        # Test
        parents = Location.objects.get_level_parents(location_level_updated.id, location.id)
        self.assertEqual(parents.count(), 5)
        names = [x.name for x in parents]
        self.assertIn(LOCATION_COMPANY, names)
        self.assertIn(LOCATION_FMU, names)
        self.assertIn('east', names)
        self.assertIn('east_lp', names)
        self.assertIn('nv', names)

    def test_objects_and_their_children(self):
        person = create_single_person()
        [person.locations.remove(x) for x in person.locations.all()]
        east = Location.objects.get(name='east')
        person.locations.add(east)
        self.assertEqual(person.locations.count(), 1)
        self.assertEqual(person.locations.first().children.count(), 2)
        # set 1 location not able to create tickets, and make sure it gets filtered out
        cant = person.locations.order_by('?')[0].location_level
        cant.can_create_tickets = False
        cant.save()

        ret = person.locations.objects_and_their_children()

        self.assertEqual(len(ret), 4)
        self.assertNotIn(cant.id, [x.location_level.id for x in Location.objects.filter(id__in=ret)])

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
        self.assertEqual(ret.name, LOCATION_COMPANY)
        self.assertEqual(ret.number, LOCATION_COMPANY)
        self.assertEqual(ret.location_level.name, settings.DEFAULT_LOCATION_LEVEL)

    def test_can_create_tickets_ids(self):
        level = Location.objects.first().location_level
        level.can_create_tickets = False
        level.save()

        ret = Location.objects.can_create_tickets_ids()

        self.assertNotIn(level.id, ret)
        self.assertEqual(
            len(ret),
            Location.objects.filter(location_level__can_create_tickets=True).count()
        )


class LocationTests(TestCase):

    def setUp(self):
        self.location = create_location()

    def test_manager(self):
        self.assertIsInstance(Location.objects, LocationManager)

    def test_meta__ordering(self):
        self.assertEqual(Location._meta.ordering, ("name", "number",))

    def test_str(self):
        self.assertEqual(
            str(self.location),
            "{}: {}".format(self.location.name, self.location.location_level.name)
        )

    def test_update_defaults(self):
        self.location.status = None
        self.location.type = None

        self.location._update_defaults()

        self.assertEqual(self.location.status, LocationStatus.objects.default())
        self.assertEqual(self.location.type, LocationType.objects.default())
