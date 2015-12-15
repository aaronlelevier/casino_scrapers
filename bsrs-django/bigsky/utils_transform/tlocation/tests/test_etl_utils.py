from django.test import TestCase

from contact.models import PhoneNumber, Email, Address
from contact.tests.factory import create_phone_number_types
from location.models import Location, LocationLevel
from utils_transform.tlocation.tests.factory import (
    create_location_region, create_location_district, create_location_store)
from utils_transform.tlocation.management.commands._etl_utils import (
    create_phone_numbers, create_email, create_address, join_region_to_district,
    join_district_to_store)


class LocationRegionTests(TestCase):
    """
    Also tests ``Base methods`` for Contact Models shared by 
    Domino -> to -> Django flat table transforms.
    """

    fixtures = ['location_levels.json', 'contact_types.json']

    def setUp(self):
        self.location_region = create_location_region()

        # Next-Gen: Location / LocationLevel
        self.location_level = LocationLevel.objects.get(name='region')
        self.location = Location.objects.create(location_level=self.location_level,
            name=self.location_region.name, number=self.location_region.number)

        # Contact Functions to test!!
        create_phone_numbers(self.location_region, self.location)
        create_email(self.location_region, self.location)
        create_address(self.location_region, self.location)

    def test_location_level(self):
        self.assertEqual(self.location.location_level, self.location_level)

    def test_location(self):
        self.assertEqual(self.location_region.name, self.location.name)
        self.assertEqual(self.location_region.number, self.location.number)

    # create_phone_number

    def test_telephone(self):
        ph = PhoneNumber.objects.get(type__name='telephone',
            number=self.location_region.telephone)

        self.assertEqual(ph.content_object, self.location)
        self.assertEqual(ph.object_id, self.location.id)

    def test_carphone(self):
        ph = PhoneNumber.objects.get(type__name='cell',
            number=self.location_region.carphone)

        self.assertEqual(ph.content_object, self.location)
        self.assertEqual(ph.object_id, self.location.id)

    def test_fax(self):
        ph = PhoneNumber.objects.get(type__name='fax',
            number=self.location_region.fax)

        self.assertEqual(ph.content_object, self.location)
        self.assertEqual(ph.object_id, self.location.id)

    # create_email

    def test_create_email(self):
        email = Email.objects.get(type__name='location',
            email=self.location_region.email)

        self.assertEqual(email.content_object, self.location)
        self.assertEqual(email.object_id, self.location.id)

    # create_address

    def test_create_address(self):
        address = {
            'address1': self.location_region.address1,
            'address2': self.location_region.address2,
            'city': self.location_region.city,
            'state': self.location_region.state,
            'zip': self.location_region.zip,
            'country': self.location_region.country
        }

        ret = Address.objects.get(type__name='location', **address)

        self.assertEqual(ret.content_object, self.location)
        self.assertEqual(ret.object_id, self.location.id)


class LocationDistrictTests(TestCase):

    fixtures = ['location_levels.json', 'contact_types.json']

    def setUp(self):
        self.domino_region = create_location_region()
        self.domino_district = create_location_district(self.domino_region)

        # Next-Gen: Location / LocationLevel
        self.region_location_level = LocationLevel.objects.get(name='region')
        self.region_location = Location.objects.create(
            location_level=self.region_location_level,
            name=self.domino_region.name, number=self.domino_region.number)

        self.district_location_level = LocationLevel.objects.get(name='district')
        self.district_location = Location.objects.create(
            location_level=self.district_location_level,
            name=self.domino_district.name, number=self.domino_district.number)

    def test_join_region_to_district__success(self):
        self.assertEqual(
            self.domino_district.regionnumber,
            self.domino_region.number
        )

        join_region_to_district(self.domino_district, self.district_location)

        self.assertIn(self.district_location, self.region_location.children.all())

    def test_join_region_to_district__fail(self):
        self.domino_district.regionnumber = 'foo'
        self.domino_district.save()
        self.assertNotEqual(
            self.domino_district.regionnumber,
            self.domino_region.number
        )

        join_region_to_district(self.domino_district, self.district_location)

        self.assertNotIn(self.district_location, self.region_location.children.all())


class LocationStore(TestCase):

    fixtures = ['location_levels.json', 'contact_types.json']

    def setUp(self):
        self.domino_region = create_location_region()
        self.domino_district = create_location_district(self.domino_region)
        self.domino_store = create_location_store(self.domino_district)

        # Next-Gen: Location / LocationLevel
        self.region_location_level = LocationLevel.objects.get(name='region')
        self.region_location = Location.objects.create(
            location_level=self.region_location_level,
            name=self.domino_region.name, number=self.domino_region.number)

        self.district_location_level = LocationLevel.objects.get(name='district')
        self.district_location = Location.objects.create(
            location_level=self.district_location_level,
            name=self.domino_district.name, number=self.domino_district.number)

        self.store_location_level = LocationLevel.objects.get(name='store')
        self.store_location = Location.objects.create(
            location_level=self.store_location_level,
            name=self.domino_store.name, number=self.domino_store.number)

    def test_join_district_to_store__success(self):
        self.assertEqual(
            self.domino_store.distnumber,
            self.domino_district.number
        )

        join_district_to_store(self.domino_store, self.store_location)

        self.assertIn(self.store_location, self.district_location.children.all())

    def test_join_district_to_store__fail(self):
        self.domino_store.distnumber = 'foo'
        self.domino_store.save()
        self.assertNotEqual(
            self.domino_store.distnumber,
            self.domino_district.number
        )
        
        join_district_to_store(self.domino_store, self.store_location)

        self.assertNotIn(self.store_location, self.district_location.children.all())
