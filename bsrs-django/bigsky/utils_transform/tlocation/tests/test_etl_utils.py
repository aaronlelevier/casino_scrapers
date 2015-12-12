from django.test import TestCase

from model_mommy import mommy

from contact.models import PhoneNumber, PhoneNumberType
from contact.tests.factory import create_phone_number_types
from location.models import Location
from person.models import Person
from person.tests.factory import create_single_person
from utils.create import _generate_chars
from utils_transform.tlocation.models import LocationRegion
from utils_transform.tlocation.management.commands._etl_utils import (
    create_phone_numbers,
)


class PhoneNumberTests(TestCase):

    def setUp(self):
        self.ph_types = create_phone_number_types()
        self.location_region = mommy.make(
            LocationRegion,
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
        self.person = create_single_person()

        # create
        create_phone_numbers(self.location_region, self.person)

    def test_telephone(self):
        location = Location.objects.get(number=self.location_region.telephone)
        self.assertEqual(
            location.telephone,
            self.location_region.telephone
        )
        self.assertEqual(self.location_region.type.name, 'telephone')

    # def test_carphone(self):
    #     location = Location.objects.get(number=self.location_region.carphone)
    #     self.assertEqual(
    #         location.carphone,
    #         self.location_region.carphone
    #     )
    #     self.assertEqual(self.location_region.type.name, 'carphone')

    # def test_fax(self):
    #     location = Location.objects.get(number=self.location_region.fax)
    #     self.assertEqual(
    #         location.fax,
    #         self.location_region.fax
    #     )
    #     self.assertEqual(self.location_region.type.name, 'fax')
