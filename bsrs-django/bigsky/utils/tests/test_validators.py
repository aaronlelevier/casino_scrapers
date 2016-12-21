from django.test import TestCase

from rest_framework.test import APITestCase

from location.tests.factory import create_locations
from location.models import Location
from location.serializers import LocationUpdateSerializer
from person.tests.factory import create_person, create_single_person, PASSWORD
from utils.validators import (
    regex_check_contains, contains_digit, contains_upper_char,
    contains_lower_char, contains_special_char, contains_no_whitespaces,
    valid_email, valid_phone)
from utils.tests.mixins import MockPermissionsAllowAnyMixin


class UniqueForActiveValidatorTests(MockPermissionsAllowAnyMixin, APITestCase):

    def setUp(self):
        super(UniqueForActiveValidatorTests, self).setUp()
        create_locations()
        self.location = Location.objects.get(name='ca')
        # Login
        self.person = create_person()
        self.client.login(username=self.person.username, password=PASSWORD)
        # Data
        serializer = LocationUpdateSerializer(self.location)
        self.data = serializer.data

    def tearDown(self):
        super(UniqueForActiveValidatorTests, self).tearDown()
        self.client.logout()

    def test_update_unique_for_active_active(self):
        self.assertTrue(self.data['number'])
        self.data['number'] = Location.objects.exclude(number=self.data['number']).first().number
        response = self.client.put('/api/admin/locations/{}/'.format(self.location.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 400)

    def test_update_unique_for_active_deleted(self):
        # delete the "old_location", so it will be fine to re-use it's ``number``
        self.assertTrue(self.data['number'])
        old_location = Location.objects.exclude(number=self.data['number']).first()
        old_location.delete()
        # Requery Update Serializer Data b/c children/parents may have changed 
        # when the "old_location" was deleted
        self.location = Location.objects.get(id=self.location.id)
        self.data = LocationUpdateSerializer(self.location).data
        # test
        self.data['number'] = old_location.number
        response = self.client.put('/api/admin/locations/{}/'.format(self.location.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 200)


DIGITS = "Bobby123"
NO_DIGITS = "django"

UPPER_CHARS = "Jimmy"
NO_UPPER_CHARS = "johnson"

LOWER_CHARS = "Jimmy"
NO_LOWER_CHARS = "JOHNSON"

SPECIAL_CHARS = "specialchar:$"
NO_SPECIAL_CHARS = "nospecialchars"

WHITESPACE = "joe tassone"
NO_WHITESPACE = "joe"


class RegexValidatorTests(TestCase):

    def test_valid_email(self):
        self.assertTrue(valid_email('foo@bar.com'))
        self.assertFalse(valid_email('foo@bar'))
        self.assertFalse(valid_email(None))

    def test_valid_phone(self):
        self.assertTrue(valid_phone('+18003331234'))
        self.assertFalse(valid_phone('+1800333'))
        self.assertFalse(valid_phone(None))

    def test_regex_check_contains_true(self):
        regex = r'\d+'
        chars = "Number1Racer"
        ret = regex_check_contains(regex, chars)
        self.assertTrue(ret)

    def test_regex_check_contains_false(self):
        regex = r'\d+'
        chars = "django"
        ret = regex_check_contains(regex, chars)
        self.assertFalse(ret)

    def test_contains_digit_true(self):
        self.assertTrue(contains_digit(DIGITS))

    def test_contains_digit_false(self):
        self.assertFalse(contains_digit(NO_DIGITS))

    def test_contains_upper_char_true(self):
        self.assertTrue(contains_upper_char(UPPER_CHARS))

    def test_contains_upper_char_false(self):
        self.assertFalse(contains_upper_char(NO_UPPER_CHARS))

    def test_contains_lower_char_true(self):
        self.assertTrue(contains_lower_char(LOWER_CHARS))

    def test_contains_lower_char_false(self):
        self.assertFalse(contains_lower_char(NO_LOWER_CHARS))

    def test_contains_special_char_true(self):
        self.assertTrue(contains_special_char(SPECIAL_CHARS))

    def test_contains_special_char_false(self):
        self.assertFalse(contains_special_char(NO_SPECIAL_CHARS))

    def test_contains_no_whitespaces_true(self):
        self.assertTrue(contains_no_whitespaces(NO_WHITESPACE))

    def test_contains_no_whitespaces_false(self):
        self.assertFalse(contains_no_whitespaces(WHITESPACE))
