from django.test import TestCase

from model_mommy import mommy

from contact.models import (State, StateManager, StateQuerySet, Country, PhoneNumber,
    PhoneNumberType, Address, AddressType, Email,  LOCATION_ADDRESS_TYPE, OFFICE_ADDRESS_TYPE,
    STORE_ADDRESS_TYPE, SHIPPING_ADDRESS_TYPE,)
from contact.tests.factory import create_contact, create_address_type
from location.models import Location
from location.tests.factory import create_location
from person.models import Person
from person.tests.factory import create_person
from tenant.tests.factory import get_or_create_tenant


class StateManagerTests(TestCase):

    def test_queryset_cls(self):
        self.assertEqual(StateManager.queryset_cls, StateQuerySet)

    def test_tenant(self):
        tenant = get_or_create_tenant()
        self.assertEqual(tenant.countries.count(), 1)
        country = tenant.countries.first()

        ret = State.objects.tenant(tenant)

        self.assertEqual(ret.count(), 2)
        self.assertEqual(ret[0].country, country)
        self.assertEqual(ret[1].country, country)


class StateTests(TestCase):

    def test_manager(self):
        self.assertIsInstance(State.objects, StateManager)


class PhoneNumberTests(TestCase):

    def setUp(self):
        self.person = create_person()
        self.location = mommy.make(Location)
        self.ph_type = mommy.make(PhoneNumberType)
        self.ph = create_contact(PhoneNumber, self.person)

    def test_create(self):
        self.assertIsInstance(self.ph, PhoneNumber)
        self.assertIsInstance(self.ph.type, PhoneNumberType)
        self.assertIsInstance(self.ph.content_object, Person)

    def test_ordering(self):
        create_contact(PhoneNumber, self.person)
        self.assertTrue(PhoneNumber.objects.count() > 1)

        self.assertEqual(
            PhoneNumber.objects.first().id,
            PhoneNumber.objects.order_by('number').first().id
        )

    ### BaseContactModel tests

    def test_content_object_person(self):
        self.assertIsInstance(self.ph.content_object, Person)

    def test_generic_fk_filter(self):
        self.assertEqual(PhoneNumber.objects.filter(object_id=self.person.id).count(), 1)

    def test_generic_fd_get(self):
        ph = PhoneNumber.objects.get(object_id=self.person.id)
        self.assertIsInstance(ph, PhoneNumber)
        self.assertEqual(str(ph.content_object.id), str(self.person.id))
        self.assertEqual(str(ph.object_id), str(self.person.id))


class AddressManagerTests(TestCase):

    def test_office_and_stores(self):
        location_type = create_address_type(LOCATION_ADDRESS_TYPE)
        office_type = create_address_type(OFFICE_ADDRESS_TYPE)
        store_type = create_address_type(STORE_ADDRESS_TYPE)
        shipping_type = create_address_type(SHIPPING_ADDRESS_TYPE)

        location = create_location()

        a = create_contact(Address, location, location_type)
        b = create_contact(Address, location, office_type)
        c = create_contact(Address, location, store_type)
        d = create_contact(Address, location, shipping_type)

        ret = Address.objects.office_and_stores()

        self.assertEqual(ret.count(), 2)
        self.assertIn(b, ret)
        self.assertIn(c, ret)


class AddressTests(TestCase):

    def setUp(self):
        self.person = create_person()
        self.location = create_location()
        self.store = create_address_type('admin.address_type.store')
        self.office = create_address_type('admin.address_type.office')

    def test_ordering(self):
        create_contact(Address, self.person)
        create_contact(Address, self.person)

        self.assertEqual(
            Address.objects.first().id,
            Address.objects.order_by('address').first().id
        )

    def test_create(self):
        state = mommy.make(State)
        country = mommy.make(Country)
        address_type = mommy.make(AddressType)

        address = Address.objects.create(
            content_object=self.person, object_id=self.person.id,
            type=address_type, address='123 St.', city='San Diego',
            state=state, postal_code='92123', country=country
        )

        self.assertIsInstance(address, Address)
        self.assertIsInstance(address.state, State)
        self.assertEqual(address.state, state)
        self.assertEqual(address.country, country)

    def test_is_office_or_store(self):
        address_type = mommy.make(AddressType)
        address = create_contact(Address, self.location)
        address.type = address_type
        address.save()
        self.assertNotIn(address.type, [self.office, self.store])
        self.assertFalse(address.is_office_or_store)

        address.type = self.office
        address.save()
        self.assertIn(address.type, [self.office, self.store])
        self.assertTrue(address.is_office_or_store)


class EmailTests(TestCase):

    def setUp(self):
        self.person = create_person()

    def test_ordering(self):
        create_contact(Email, self.person)
        create_contact(Email, self.person)

        self.assertEqual(
            Email.objects.first().id,
            Email.objects.order_by('email').first().id
        )
