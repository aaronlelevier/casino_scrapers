from django.test import TestCase

from model_mommy import mommy

from contact.models import (PhoneNumber, PhoneNumberType,
    Address, AddressType, Email, EmailType)


class ModelTests(TestCase):

    def test_ph_num(self):
        ph = mommy.make(PhoneNumber)
        self.assertIsInstance(ph, PhoneNumber)
        self.assertIsInstance(ph.type, PhoneNumberType)

    def test_address(self):
        a  = mommy.make(Address)
        self.assertIsInstance(a, Address)
        self.assertIsInstance(a.type, AddressType)

    def test_address_str(self):
        a  = mommy.make(Address)
        self.assertEqual(str(a), "")

        st_name = '123 St.'
        b = mommy.make(Address, address1=st_name)
        self.assertEqual(str(b), st_name)

    def test_email(self):
        e = mommy.make(Email)
        self.assertIsInstance(e, Email)
        self.assertIsInstance(e.type, EmailType)