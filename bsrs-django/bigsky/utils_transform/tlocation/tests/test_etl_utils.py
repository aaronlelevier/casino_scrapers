from django.test import TestCase

from model_mommy import mommy

from contact.models import State, Country, PhoneNumber, Email, Address
from contact.tests.factory import create_phone_number_types
from location.models import Location, LocationLevel
from utils_transform.tlocation.management.commands._etl_utils import (
    create_phone_numbers, create_email, create_address, _resolve_none_str, _resolve_state,
    _resolve_country, join_company_to_region, join_region_to_district, join_district_to_store)
from utils_transform.tlocation.models import LocationRegion
from utils_transform.tlocation.tests.factory import (
    create_location_region, create_location_district, create_location_store)


class LocationRegionTests(TestCase):
    """
    Also tests ``Base methods`` for Contact Models shared by 
    Domino -> to -> Django flat table transforms.
    """

    fixtures = ['location_levels.json', 'contact_types.json']

    def setUp(self):
        self.company = Location.objects.create_top_level()
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
        ph = PhoneNumber.objects.get(type__name='admin.phonenumbertype.telephone',
            number=self.location_region.telephone)

        self.assertEqual(ph.content_object, self.location)
        self.assertEqual(ph.object_id, self.location.id)

    def test_carphone(self):
        ph = PhoneNumber.objects.get(type__name='admin.phonenumbertype.cell',
            number=self.location_region.carphone)

        self.assertEqual(ph.content_object, self.location)
        self.assertEqual(ph.object_id, self.location.id)

    def test_fax(self):
        ph = PhoneNumber.objects.get(type__name='admin.phonenumbertype.fax',
            number=self.location_region.fax)

        self.assertEqual(ph.content_object, self.location)
        self.assertEqual(ph.object_id, self.location.id)

    # create_email

    def test_create_email(self):
        email = Email.objects.get(type__name='admin.emailtype.location',
            email=self.location_region.email)

        self.assertEqual(email.content_object, self.location)
        self.assertEqual(email.object_id, self.location.id)

    def test_create_email__isinstance(self):
        ret = create_email(self.location_region, self.location)

        self.assertIsInstance(ret, Email)

    # create_address

    def test_create_address(self):
        address = {
            'address': self.location_region.address1+' '+self.location_region.address2,
            'city': self.location_region.city,
            'postal_code': self.location_region.zip
        }

        ret = Address.objects.get(type__name='admin.address_type.location', **address)

        self.assertEqual(ret.content_object, self.location)
        self.assertEqual(ret.object_id, self.location.id)

    def test_create_address__address1_is_none(self):
        self.location_region.address1 = None
        self.location_region.save()

        ret = create_address(self.location_region, self.location)

        self.assertIsInstance(ret, Address)

    def test_create_address__empty(self):
        """
        If all fields are None, shouldn't create an Address.
        """
        d = mommy.make(LocationRegion, name='a')
        self.assertFalse(any([d.address1, d.address2, d.city, d.state, d.zip, d.country]))

        ret = create_address(d, self.location)

        self.assertIsNone(ret)

    def test_create_address__state_n_country(self):
        domino_region = mommy.make(LocationRegion, name='a', state='CA', country='U.S.')
        init_count = State.objects.count()
        init_count_country = Country.objects.count()

        ret = create_address(domino_region, self.location)

        self.assertIsInstance(ret.state, State)
        self.assertEqual(State.objects.count(), init_count+1)
        self.assertIsInstance(ret.country, Country)
        self.assertEqual(Country.objects.count(), init_count_country+1)

    # _resolve_none_str

    def test_resolve_none_str__none(self):
        s = None
        ret = _resolve_none_str(s)
        self.assertEqual('', ret)

    def test_resolve_none_str__string(self):
        s = 'foo'
        ret = _resolve_none_str(s)
        self.assertEqual(s, ret)

    # _resolve_state

    def test_resolve_state__none(self):
        ret = _resolve_state(None)
        self.assertIsNone(ret)

    def test_resolve_state__create(self):
        init_count = State.objects.count()
        # arbitrary state 'abbr' to force a State create
        self.location_region.state = 'XX'
        self.location_region.save()

        ret = _resolve_state(self.location_region.state)

        self.assertEqual(State.objects.count(), init_count+1)
        self.assertIsInstance(ret, State)

    def test_resolve_state__get(self):
        abbr = "NY"
        state = mommy.make(State, abbr=abbr)
        init_count = State.objects.count()
        self.location_region.state = abbr
        self.location_region.save()
        self.assertEqual(self.location_region.state, state.abbr)

        ret = _resolve_state(self.location_region.state)

        self.assertEqual(State.objects.count(), init_count)
        self.assertIsInstance(ret, State)

    # _resolve_country

    def test_resolve_country__none(self):
        ret = _resolve_country(None)
        self.assertIsNone(ret)

    def test_resolve_country__create(self):
        init_count = Country.objects.count()
        # arbitrary country 'name' to force a Country create
        self.location_region.country = 'XX'
        self.location_region.save()

        ret = _resolve_country(self.location_region.country)

        self.assertEqual(Country.objects.count(), init_count+1)
        self.assertIsInstance(ret, Country)

    def test_resolve_country__get(self):
        name = "U.S"
        country = mommy.make(Country, name=name)
        init_count = Country.objects.count()
        self.location_region.country = name
        self.location_region.save()
        self.assertEqual(self.location_region.country, country.name)

        ret = _resolve_country(self.location_region.country)

        self.assertEqual(Country.objects.count(), init_count)
        self.assertIsInstance(ret, Country)

    # join_company_to_region

    def test_join_company_to_region(self):
        company = Location.objects.create_top_level()
        self.assertEqual(self.company.children.count(), 0)

        join_company_to_region(company, self.location)

        self.assertEqual(self.company.children.count(), 1)
        self.assertEqual(self.company.children.first(), self.location)


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
