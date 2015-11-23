from rest_framework.test import APITestCase

from model_mommy import mommy

from location.tests.factory import  create_locations
from location.models import Location
from location.serializers import LocationUpdateSerializer
from person.tests.factory import create_person, PASSWORD


class LocationUpdateTests(APITestCase):

    def setUp(self):
        create_locations()
        self.location = Location.objects.get(name='ca')
        # Login
        self.person = create_person()
        self.client.login(username=self.person.username, password=PASSWORD)
        # Data
        serializer = LocationUpdateSerializer(self.location)
        self.data = serializer.data

    def test_update_parents_same_location_level(self):
        # This should raise a ValidationError (400) b/c Parents/Children can't 
        # have the same LocationLevel as the Location
        new_location = mommy.make(Location, location_level=self.location.location_level)
        self.data['parents'] = [str(new_location.id)]
        response = self.client.put('/api/admin/locations/{}/'.format(self.location.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 400)

    def test_update_children_same_location_level(self):
        # This should raise a ValidationError (400) b/c Parents/Children can't 
        # have the same LocationLevel as the Location
        new_location = mommy.make(Location, location_level=self.location.location_level)
        self.data['children'] = [str(new_location.id)]
        response = self.client.put('/api/admin/locations/{}/'.format(self.location.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 400)
