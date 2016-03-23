from django.conf import settings
from django.test import TestCase

from location.models import (Location, LocationLevel, LOCATION_COMPANY,
LOCATION_REGION, LOCATION_DISTRICT, LOCATION_STORE, LOCATION_FMU,)
from location.tests import factory


class CreateLocationLevelsTests(TestCase):

    def setUp(self):
        factory.create_location_levels()
        self.company = LocationLevel.objects.get(name=LOCATION_COMPANY)
        self.fmu = LocationLevel.objects.get(name=LOCATION_FMU)
        self.region = LocationLevel.objects.get(name=LOCATION_REGION)
        self.district = LocationLevel.objects.get(name=LOCATION_DISTRICT)
        self.store = LocationLevel.objects.get(name=LOCATION_STORE)

    def test_names(self):
        self.assertIsInstance(LocationLevel.objects.get(name=LOCATION_COMPANY), LocationLevel)
        self.assertIsInstance(LocationLevel.objects.get(name=LOCATION_REGION), LocationLevel)
        self.assertIsInstance(LocationLevel.objects.get(name=LOCATION_DISTRICT), LocationLevel)
        self.assertIsInstance(LocationLevel.objects.get(name=LOCATION_STORE), LocationLevel)
        self.assertIsInstance(LocationLevel.objects.get(name=LOCATION_FMU), LocationLevel)

    def test_create_location_levels(self):
        self.assertEqual(LocationLevel.objects.count(), 5)

    def test_company_children(self):
        company = LocationLevel.objects.get(name=LOCATION_COMPANY)
        self.assertEqual(company.children.count(), 2)
        self.assertIn(self.region, company.children.all())
        self.assertIn(self.fmu, company.children.all())

    def test_region_children(self):
        region = LocationLevel.objects.get(name=LOCATION_REGION)
        self.assertEqual(region.children.count(), 1)
        self.assertIn(self.district, region.children.all())

    def test_district_children(self):
        district = LocationLevel.objects.get(name=LOCATION_DISTRICT)
        self.assertEqual(district.children.count(), 1)
        self.assertIn(self.store, district.children.all())

    def test_fmu_children(self):
        fmu = LocationLevel.objects.get(name=LOCATION_FMU)
        self.assertEqual(fmu.children.count(), 1)
        self.assertIn(self.store, fmu.children.all())

    def test_store_children(self):
        store = LocationLevel.objects.get(name=LOCATION_STORE)
        self.assertEqual(store.children.count(), 0)

    def test_default(self):
        self.assertEqual(settings.DEFAULT_LOCATION_LEVEL, 'Company')


class CreateLocationLevelTests(TestCase):

    def test_main(self):
        ret = factory.create_location_level()
        self.assertIsInstance(ret, LocationLevel)
        self.assertEqual(ret.name, LOCATION_COMPANY)


class CreateLocationsTests(TestCase):

    def setUp(self):
        factory.create_locations()

    def test_counts(self):
        self.assertEqual(LocationLevel.objects.count(), 5)
        self.assertEqual(Location.objects.count(), 7)

    def test_company(self):
        company = Location.objects.get(name=settings.LOCATION_TOP_LEVEL_NAME)

        self.assertIsInstance(company, Location)
        self.assertEqual(company.parents.count(), 0)
        self.assertEqual(company.children.count(), 2)
        self.assertIn(Location.objects.get(name='east'), company.children.all())
        self.assertIn(Location.objects.get(name=LOCATION_FMU), company.children.all())

    def test_fmu(self):
        fmu_ll = LocationLevel.objects.get(name=LOCATION_FMU)
        fmus = Location.objects.filter(location_level=fmu_ll)

        fmu = fmus.first()

        self.assertEqual(fmus.count(), 1)
        self.assertEqual(fmu.name, LOCATION_FMU)
        self.assertEqual(fmu.parents.count(), 1)
        self.assertEqual(fmu.parents.first(), Location.objects.get(name=settings.LOCATION_TOP_LEVEL_NAME))
        self.assertEqual(fmu.children.count(), 0)

    def test_region(self):
        east = Location.objects.get(name='east')

        self.assertEqual(east.parents.count(), 1)
        self.assertEqual(east.parents.first().name, settings.LOCATION_TOP_LEVEL_NAME)

    def test_district__one(self):
        ca = Location.objects.get(name='ca')

        self.assertEqual(ca.parents.count(), 1)
        self.assertEqual(ca.parents.first(), Location.objects.get(name='east'))
        self.assertEqual(ca.children.count(), 2)
        self.assertIn(Location.objects.get(name=factory.SAN_DIEGO), ca.children.all())
        self.assertIn(Location.objects.get(name=factory.LOS_ANGELES), ca.children.all())

    def test_district__two(self):
        nv = Location.objects.get(name='nv')

        self.assertEqual(nv.parents.count(), 1)
        self.assertEqual(nv.parents.first(), Location.objects.get(name='east'))
        self.assertEqual(nv.children.count(), 0)

    def test_store__one(self):
        san_diego = Location.objects.get(name=factory.SAN_DIEGO)

        self.assertEqual(san_diego.parents.count(), 1)
        self.assertEqual(san_diego.parents.first(), Location.objects.get(name='ca'))
        self.assertEqual(san_diego.children.count(), 0)

    def test_store__two(self):
        los_angeles = Location.objects.get(name=factory.LOS_ANGELES)

        self.assertEqual(los_angeles.parents.count(), 1)
        self.assertEqual(los_angeles.parents.first(), Location.objects.get(name='ca'))
        self.assertEqual(los_angeles.children.count(), 0)

    def test_create_locations__at_least_one_for_each_location_level(self):
        for x in LocationLevel.objects.all():
            self.assertTrue(Location.objects.filter(location_level=x).exists())


class CreateLocationsWithManyArgTests(TestCase):

    def test_create_locations__many(self):
        _many = 25
        factory.create_locations(_many)

        self.assertEqual(Location.objects.count(), _many)

    def test_create_locations__many__no_affect_if_less_than_current_count(self):
        _many = 1
        factory.create_locations(_many)

        self.assertTrue(Location.objects.count() > _many)


class CreateLocationTests(TestCase):

    def test_create_location(self):
        ret = factory.create_location()

        self.assertIsInstance(ret, Location)

    def test_create_location__with_specific_location_level(self):
        factory.create_location_levels()
        location_level = LocationLevel.objects.order_by("?")[0]

        ret = factory.create_location(location_level)

        self.assertIsInstance(ret, Location)
        self.assertEqual(ret.location_level, location_level)
