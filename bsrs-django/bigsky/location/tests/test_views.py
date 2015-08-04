import uuid
import json

from django.test import TestCase

from rest_framework.test import APITestCase, APITransactionTestCase
from model_mommy import mommy

from location import serializers as ls
from location.tests.factory import create_location_levels
from location.models import (Location, LocationLevel, LocationStatus,
    LocationType)
from person.tests.factory import create_person, PASSWORD


class LocationLevelTests(APITestCase):

    def setUp(self):
        create_location_levels()
        self.district = LocationLevel.objects.get(name='district')
        # Login
        self.person = create_person()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_list(self):
        response = self.client.get('/api/admin/location_levels/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertIsInstance(
            LocationLevel.objects.get(id=data['results'][0]['id']),
            LocationLevel
        )

    def test_get(self):
        response = self.client.get('/api/admin/location_levels/{}/'.format(self.district.id))
        self.assertEqual(response.status_code, 200)

    def test_get_children(self):
        response = self.client.get('/api/admin/location_levels/{}/'.format(self.district.id))
        data = json.loads(response.content)
        self.assertIn(
            LocationLevel.objects.get(id=data['children'][0]['id']),
            self.district.children.all()
        )

    def test_get_parents(self):
        response = self.client.get('/api/admin/location_levels/{}/'.format(self.district.id))
        data = json.loads(response.content)
        self.assertIn(
            LocationLevel.objects.get(id=data['parents'][0]['id']),
            self.district.parents.all()
        )

    def test_create(self):
        new_name = 'region_lp'
        data = {
            'id': str(uuid.uuid4()),
            'name': new_name,
            'children': []
        }
        response = self.client.post('/api/admin/location_levels/', data, format='json')
        data = json.loads(response.content)
        print data
        self.assertIsInstance(LocationLevel.objects.get(id=data['id']), LocationLevel)

    def test_update(self):
        region = LocationLevel.objects.get(name='region')
        old_name = region.name
        data = {
            'id': str(region.id),
            'name': 'new_name',
            'children': [str(r.id) for r in region.children.all()]
        }
        response = self.client.put('/api/admin/location_levels/{}/'.format(region.id), data, format='json')
        data = json.loads(response.content)
        print data
        self.assertNotEqual(data['name'], old_name)


class LocationTests(APITestCase):

    def setUp(self):
        self.location = mommy.make(Location)
        # Login
        self.person = create_person()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_list(self):
        response = self.client.get('/api/admin/locations/')
        self.assertEqual(response.status_code, 200)

    def test_list_status(self):
        response = self.client.get('/api/admin/locations/')
        data = json.loads(response.content)
        self.assertIsInstance(
            LocationStatus.objects.get(id=data['results'][0]['status']['id']),
            LocationStatus
        )

    def test_list_location_level(self):
        response = self.client.get('/api/admin/locations/')
        data = json.loads(response.content)
        self.assertIsInstance(
            LocationLevel.objects.get(id=data['results'][0]['location_level']['id']),
            LocationLevel
        )

    def test_get(self):
        response = self.client.get('/api/admin/locations/{}/'.format(self.location.id))
        self.assertEqual(response.status_code, 200)

