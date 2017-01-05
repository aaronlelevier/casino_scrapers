from django.test import TestCase

from model_mommy import mommy

from contact.models import State, Country, PhoneNumber, Email, Address
from contact.tests.factory import create_contact_types
from location.models import (Location, LocationStatus, LocationType, LocationLevel,
    LOCATION_REGION, LOCATION_DISTRICT, LOCATION_STORE)
from location.tests.factory import (create_location,
    create_location_level ,create_location_levels)
from utils.tests.test_helpers import create_default
from utils_transform.tlocation.management.commands._etl_utils import (
    create_phone_numbers, create_email, create_address, _resolve_none_str, _resolve_state,
    _resolve_country, join_company_to_region, join_region_to_district, join_district_to_store)
from utils_transform.tlocation.models import LocationRegion
from utils_transform.tlocation.tests.factory import (
    create_location_region, create_location_district, create_location_store)


class LocationSetupMixin(object):

    def setUp(self):
        create_default(LocationStatus)
        create_default(LocationType)
        create_location_levels()
        create_contact_types()


class LocationRegionTests(LocationSetupMixin, TestCase):
    # Also tests ``Base methods`` for Contact Models shared by
    # Domino -> to -> Django flat table transforms.
    def setUp(self):
        super(LocationRegionTests, self).setUp()
        self.company = Location.objects.create_top_level()
        self.location_region = create_location_region()

        # Next-Gen: Location / LocationLevel
        self.location_level = LocationLevel.objects.get(name=LOCATION_REGION)
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

    def test_create_email__dont_create_if_no_email(self):
        self.location_region.email = None

        ret = create_email(self.location_region, self.location)

        self.assertIsNone(ret)


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
        self.assertIsInstance(ret.country, Country)

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
        state_code = "NY"
        state = mommy.make(State, state_code=state_code)
        init_count = State.objects.count()
        self.location_region.state = state_code
        self.location_region.save()
        self.assertEqual(self.location_region.state, state.state_code)

        ret = _resolve_state(self.location_region.state)

        self.assertEqual(State.objects.count(), init_count)
        self.assertIsInstance(ret, State)

    def test_resolve_state__multiple(self):
        state_code = "NY"
        # multiple states w/ the same state_code are gracefully handled
        state = mommy.make(State, state_code=state_code)
        state_two = mommy.make(State, state_code=state_code)
        init_count = State.objects.count()
        self.location_region.state = state_code
        self.location_region.save()
        self.assertEqual(self.location_region.state, state.state_code)

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
        common_name = "U.S"
        country = mommy.make(Country, common_name=common_name)
        init_count = Country.objects.count()
        self.location_region.country = common_name
        self.location_region.save()
        self.assertEqual(self.location_region.country, country.common_name)

        ret = _resolve_country(self.location_region.country)

        self.assertEqual(Country.objects.count(), init_count)
        self.assertIsInstance(ret, Country)

    def test_resolve_country__multiple(self):
        common_name = "U.S"
        # multiple countries w/ the same common_name are gracefully handled
        country = mommy.make(Country, common_name=common_name)
        country_two = mommy.make(Country, common_name=common_name)
        init_count = Country.objects.count()
        self.location_region.country = common_name
        self.location_region.save()
        self.assertEqual(self.location_region.country, country.common_name)

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


class LocationDistrictTests(LocationSetupMixin, TestCase):

    def setUp(self):
        super(LocationDistrictTests, self).setUp()
        self.domino_region = create_location_region()
        self.domino_district = create_location_district(self.domino_region)

        # Next-Gen: Location / LocationLevel
        self.region_location_level = LocationLevel.objects.get(name=LOCATION_REGION)
        self.region_location = Location.objects.create(
            location_level=self.region_location_level,
            name=self.domino_region.name, number=self.domino_region.number)

        self.district_location_level = LocationLevel.objects.get(name=LOCATION_DISTRICT)
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

    def test_join_region_to_district__does_not_exist(self):
        self.domino_district.regionnumber = 'foo'
        self.domino_district.save()
        self.assertNotEqual(
            self.domino_district.regionnumber,
            self.domino_region.number
        )

        join_region_to_district(self.domino_district, self.district_location)

        self.assertNotIn(self.district_location, self.region_location.children.all())

    def test_join_region_to_district__multiple(self):
        location_level_region = create_location_level(LOCATION_REGION)
        region = create_location(location_level_region)
        region.number = self.domino_district.regionnumber
        region.save()
        self.assertTrue(Location.objects.filter(
            location_level__name=LOCATION_REGION).count() > 1)

        join_region_to_district(self.domino_district, self.district_location)

        self.assertNotIn(self.district_location, self.region_location.children.all())


class LocationStoreTests(LocationSetupMixin, TestCase):

    def setUp(self):
        super(LocationStoreTests, self).setUp()
        self.domino_region = create_location_region()
        self.domino_district = create_location_district(self.domino_region)
        self.domino_store = create_location_store(self.domino_district)

        # Next-Gen: Location / LocationLevel
        self.region_location_level = LocationLevel.objects.get(name=LOCATION_REGION)
        self.region_location = Location.objects.create(
            location_level=self.region_location_level,
            name=self.domino_region.name, number=self.domino_region.number)

        self.district_location_level = LocationLevel.objects.get(name=LOCATION_DISTRICT)
        self.district_location = Location.objects.create(
            location_level=self.district_location_level,
            name=self.domino_district.name, number=self.domino_district.number)

        self.store_location_level = LocationLevel.objects.get(name=LOCATION_STORE)
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

    def test_join_district_to_store__does_not_exist(self):
        self.domino_store.distnumber = 'foo'
        self.domino_store.save()
        self.assertNotEqual(
            self.domino_store.distnumber,
            self.domino_district.number
        )
        
        join_district_to_store(self.domino_store, self.store_location)

        self.assertNotIn(self.store_location, self.district_location.children.all())

    def test_join_region_to_district__multiple(self):
        location_level_district = create_location_level(LOCATION_DISTRICT)
        district = create_location(location_level_district)
        district.number = self.domino_store.distnumber
        district.save()
        self.assertTrue(Location.objects.filter(
            location_level__name=LOCATION_DISTRICT).count() > 1)

        join_district_to_store(self.domino_store, self.store_location)

        self.assertNotIn(self.store_location, self.district_location.children.all())
