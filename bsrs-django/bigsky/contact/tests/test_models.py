from django.test import TestCase

from model_mommy import mommy

from contact.models import (
    PersonPhoneNumber, LocationPhoneNumber, PhoneNumberType,
    PersonAddress, LocationAddress, AddressType,
    PersonEmail, LocationEmail, EmailType
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


class AddressTests(TestCase):

    def test_address_str(self):
        a  = mommy.make(PersonAddress)
        self.assertEqual(str(a), "")

        p = create_person()
        st_name = '123 St.'
        b = mommy.make(PersonAddress, person=p, address1=st_name)
        self.assertEqual(str(b), st_name)


class PersonAddressTests(TestCase):

    def test_address(self):
        pa  = mommy.make(PersonAddress)
        self.assertIsInstance(pa, PersonAddress)
        self.assertIsInstance(pa.person, Person)


class PersonEmailTests(TestCase):

    def test_email(self):
        e = mommy.make(PersonEmail)
        self.assertIsInstance(e, PersonEmail)
        self.assertIsInstance(e.person, Person)