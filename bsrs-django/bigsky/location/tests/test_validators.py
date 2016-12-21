import json

from rest_framework.test import APITestCase

from model_mommy import mommy

from location.tests.factory import  create_locations
from location.models import Location
from location.serializers import LocationUpdateSerializer
from location.validators import LocationParentChildValidator
from person.tests.factory import create_person, PASSWORD
from utils.tests.mixins import MockPermissionsAllowAnyMixin


class LocationUpdateTests(MockPermissionsAllowAnyMixin, APITestCase):

    def setUp(self):
        super(LocationUpdateTests, self).setUp()
        create_locations()
        self.location = Location.objects.get(name='ca')
        # Login
        self.person = create_person()
        self.client.login(username=self.person.username, password=PASSWORD)
        # Data
        serializer = LocationUpdateSerializer(self.location)
        self.data = serializer.data
        # Error msg
        self.message = LocationParentChildValidator.message

    def tearDown(self):
        super(LocationUpdateTests, self).tearDown()
        self.client.logout()

    def test_update_parents_same_location_level(self):
        # This should raise a ValidationError (400) b/c Parents/Children can't
        # have the same LocationLevel as the Location
        key = 'parents'
        new_location = mommy.make(Location, location_level=self.location.location_level)
        self.data[key] = [str(new_location.id)]

        response = self.client.put('/api/admin/locations/{}/'.format(self.location.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            json.loads(response.content.decode('utf8'))['non_field_errors'][0],
            self.message.format(key=key, values=new_location.location_level,
                location_level=self.location.location_level)
        )

    def test_update_children_same_location_level(self):
        # This should raise a ValidationError (400) b/c Parents/Children can't
        # have the same LocationLevel as the Location
        key = 'children'
        new_location = mommy.make(Location, location_level=self.location.location_level)
        self.data[key] = [str(new_location.id)]

        response = self.client.put('/api/admin/locations/{}/'.format(self.location.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            json.loads(response.content.decode('utf8'))['non_field_errors'][0],
            self.message.format(key=key, values=new_location.location_level,
                location_level=self.location.location_level)
        )
