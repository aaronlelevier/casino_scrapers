from django.test import TestCase

from model_mommy import mommy

from contact.models import (PhoneNumber, PhoneNumberType,
    Address, AddressType, Email, EmailType)
from location.models import Location
from person.models import Person
from person.tests.factory import create_person
from util import exceptions as excp


class PhoneNumberTests(TestCase):

    # also tests ``ContactBaseModel`` save() methods

    def setUp(self):
        self.person = mommy.make(Person)
        self.location = mommy.make(Location)

    def test_ph_model_create(self):
        ph = mommy.make(PhoneNumber, person=self.person)
        self.assertIsInstance(ph, PhoneNumber)
        self.assertIsInstance(ph.type, PhoneNumberType)

    def test_ph_str(self):
        ph = mommy.make(PhoneNumber, person=self.person)
        self.assertEqual(str(ph), ph.number)

    def test_person_and_location(self):
        with self.assertRaises(excp.CantHavePersonAndLocation):
            mommy.make(PhoneNumber, person=self.person, location=self.location)

    def test_no_person_or_location(self):
        with self.assertRaises(excp.PersonOrLocationRequired):
            mommy.make(PhoneNumber)


class AddressTests(TestCase):

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


class EmailTests(TestCase):

    def setUp(self):
        self.person = mommy.make(Person)

    def test_email(self):
        e = mommy.make(Email, person=self.person)
        self.assertIsInstance(e, Email)
        self.assertIsInstance(e.type, EmailType)

    def test_str(self):
        e = mommy.make(Email, person=self.person)
        self.assertEqual(str(e), e.email)
