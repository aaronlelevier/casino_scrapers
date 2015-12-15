from django.test import TestCase

from contact.models import PhoneNumber, Email, Address
from contact.tests.factory import create_phone_number_types
from location.models import Location, LocationLevel
from utils_transform.tlocation.tests.factory import create_location_region
from utils_transform.tlocation.management.commands._etl_utils import (
    create_phone_numbers, create_email, create_address)


class EtlUtilsTests(TestCase):

    fixtures = ['location_levels.json', 'contact_types.json']

    def setUp(self):
        self.ph_types = create_phone_number_types()
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
