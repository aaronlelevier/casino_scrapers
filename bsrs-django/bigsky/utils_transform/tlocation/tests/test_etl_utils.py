from django.test import TestCase

from model_mommy import mommy

from contact.models import (PhoneNumber, PhoneNumberType, Email, EmailType,
    Address, AddressType, PHONE_NUMBER_TYPES, EMAIL_TYPES, ADDRESS_TYPES)
from contact.tests.factory import create_phone_number_types
from location.models import Location, LocationLevel
from person.models import Person
from utils.create import _generate_chars
from utils_transform.tlocation.models import LocationRegion
from utils_transform.tlocation.management.commands._etl_utils import (
    create_phone_numbers, create_email,
)


class EtlUtilsTests(TestCase):

    fixtures = ['location_levels.json', 'phone_number_types.json']

    def setUp(self):
        self.ph_types = create_phone_number_types()
        self.location_region = mommy.make(
            LocationRegion,
            name=_generate_chars(),
            number=_generate_chars(),
            telephone=_generate_chars(),
            carphone=_generate_chars(),
            fax=_generate_chars(),
            email=_generate_chars(),
            address2='Ste 140',
            city='Omaha',
            state='NE',
            zip=92126,
            country='United States',
        )

        # Next-Gen: Location / LocationLevel
        self.location_level = LocationLevel.objects.get(name='region')
        self.location = Location.objects.create(location_level=self.location_level,
            name=self.location_region.name, number=self.location_region.number)

        # Function to test!!
        create_phone_numbers(self.location_region, self.location)

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

    # def test_create_email(self):
    #     email = Email.objects.get(type__name='email',
    #         email=self.location_region.email)

    #     self.assertEqual(email.content_object, self.location)
    #     self.assertEqual(email.object_id, self.location.id)
