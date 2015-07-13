from django.test import TestCase

from model_mommy import mommy

from contact.models import (
    PersonPhoneNumber, LocationPhoneNumber, PhoneNumberType,
    Address, AddressType, Email, EmailType
)
from location.models import Location
from person.models import Person
from person.tests.factory import create_person
from util import exceptions as excp


class PhoneNumberTests(TestCase):
    # Only test ``PersonPhoneNumber`` for common functionality b/n
    # PhoneNumber Models.

    def test_ph_num(self):
        ph = mommy.make(PersonPhoneNumber)
        self.assertIsInstance(ph, PersonPhoneNumber)
        self.assertIsInstance(ph.type, PhoneNumberType)


class AddresTests(TestCase):

    def test_address(self):
        p = create_person()
        a  = mommy.make(Address, person=p)
        self.assertIsInstance(a, Address)
        self.assertIsInstance(a.type, AddressType)

    def test_address_str(self):
        p = create_person()
        a  = mommy.make(Address, person=p)
        self.assertEqual(str(a), "")

        st_name = '123 St.'
        b = mommy.make(Address, person=p, address1=st_name)
        self.assertEqual(str(b), st_name)

    def test_no_person_or_location(self):
        with self.assertRaises(excp.PersonOrLocationRequired):
            a  = mommy.make(Address)

    def test_person_and_location(self):
        p = mommy.make(Person)
        l = mommy.make(Location)
        with self.assertRaises(excp.CantHavePersonLocation):
            a  = mommy.make(Address, person=p, location=l)

    def test_valid_person_or_location_ok(self):
        l = mommy.make(Location)
        a  = mommy.make(Address, location=l)
        self.assertIsInstance(a, Address)


class EmailTests(TestCase):

    def test_email(self):
        e = mommy.make(Email)
        self.assertIsInstance(e, Email)
        self.assertIsInstance(e.type, EmailType)