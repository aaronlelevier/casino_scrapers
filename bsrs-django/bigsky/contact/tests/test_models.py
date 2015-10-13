from django.test import TestCase
from django.contrib.auth.models import ContentType

from model_mommy import mommy

from contact.models import (PhoneNumber, PhoneNumberType,
    Address, AddressType, Email, EmailType)
from location.models import Location
from person.models import Person
from person.tests.factory import create_person
from utils import exceptions as excp


class PhoneNumberTests(TestCase):

    def setUp(self):
        self.person = create_person()
        self.location = mommy.make(Location)
        self.ph_type = mommy.make(PhoneNumberType)
        self.ph = PhoneNumber.objects.create(number='1',
            type=self.ph_type, content_object=self.person)

    def test_create(self):
        self.assertIsInstance(self.ph, PhoneNumber)
        self.assertIsInstance(self.ph.type, PhoneNumberType)
        self.assertIsInstance(self.ph.content_object, Person)

    # ### BaseContactModel tests

    def test_content_object_person(self):
        self.assertIsInstance(self.ph.content_object, Person)

    def test_generic_fk_filter(self):
        self.assertEqual(PhoneNumber.objects.filter(object_id=self.person.id).count(), 1)

    def test_generic_fd_get(self):
        ph = PhoneNumber.objects.get(object_id=self.person.id)
        self.assertIsInstance(ph, PhoneNumber)
        self.assertEqual(ph.content_object, self.person)


class AddressTests(TestCase):

    def setUp(self):
        self.person = create_person()

    def test_address(self):
        a = mommy.make(Address, content_object=self.person)
        self.assertIsInstance(a, Address)
        self.assertIsInstance(a.type, AddressType)


class EmailTests(TestCase):

    def setUp(self):
        self.person = create_person()

    def test_email(self):
        e = mommy.make(Email, content_object=self.person)
        self.assertIsInstance(e, Email)
        self.assertIsInstance(e.type, EmailType)
