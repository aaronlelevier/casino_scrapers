import uuid
import json

from rest_framework.test import APITestCase
from model_mommy import mommy

from location.tests.factory import create_location_levels, create_locations
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

    def test_get_parents(self):
        response = self.client.get('/api/admin/location_levels/{}/'.format(self.district.id))
        data = json.loads(response.content)
        self.assertIn(
            LocationLevel.objects.get(id=data['parents'][0]['id']),
            self.district.parents.all()
        )

    def test_get_children(self):
        response = self.client.get('/api/admin/location_levels/{}/'.format(self.district.id))
        data = json.loads(response.content)
        self.assertIn(
            LocationLevel.objects.get(id=data['children'][0]['id']),
            self.district.children.all()
        )

    def test_create(self):
        new_name = 'region_lp'
        data = {
            'id': str(uuid.uuid4()),
            'name': new_name,
            'children': []
        }
        response = self.client.post('/api/admin/location_levels/', data, format='json')
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content)
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
        self.assertNotEqual(data['name'], old_name)


class LocationListTests(APITestCase):

    def setUp(self):
        create_locations()
        self.location = Location.objects.get(name='ca')
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


class LocationDetailTests(APITestCase):

    def setUp(self):
        create_locations()
        self.location = Location.objects.get(name='ca')
        # Login
        self.person = create_person()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_get(self):
        response = self.client.get('/api/admin/locations/{}/'.format(self.location.id))
        self.assertEqual(response.status_code, 200)

    def test_get_location_level(self):
        response = self.client.get('/api/admin/locations/{}/'.format(self.location.id))
        data = json.loads(response.content)
        self.assertIsInstance(
            LocationLevel.objects.get(id=data['location_level']['id']),
            LocationLevel
        )

    def test_get_status(self):
        response = self.client.get('/api/admin/locations/{}/'.format(self.location.id))
        data = json.loads(response.content)
        self.assertIsInstance(
            LocationStatus.objects.get(id=data['status']),
            LocationStatus
        )

    def test_get_parents(self):
        response = self.client.get('/api/admin/locations/{}/'.format(self.location.id))
        data = json.loads(response.content)
        self.assertIn(
            Location.objects.get(id=data['parents'][0]['id']),
            self.location.parents.all()
        )

    def test_get_children(self):
        response = self.client.get('/api/admin/locations/{}/'.format(self.location.id))
        data = json.loads(response.content)
        self.assertIn(
            Location.objects.get(id=data['children'][0]['id']),
            self.location.children.all()
        )

    ### DETAIL ROUTES

    def test_get_level_children(self):
        # SetUp
        east = Location.objects.get(name='east')
        store_ll = LocationLevel.objects.get(name='store')
        # Test
        response = self.client.get('/api/admin/locations/{pk}/level/{level_id}/'.format(
            pk=east.id, level_id=store_ll.id))
        data = json.loads(response.content)
        store1 = Location.objects.filter(location_level=store_ll).first()
        self.assertIn(str(store1.id), response.content)


class LocationCreateTests(APITestCase):

    def setUp(self):
        create_locations()
        self.location = Location.objects.get(name='ca')
        # Login
        self.person = create_person()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_create(self):
        new_uuid = str(uuid.uuid4())
        data = {
            'id': new_uuid,
            'name': 'tx',
            'number': '123',
            'status': str(LocationStatus.objects.first().id),
            'location_level': str(LocationLevel.objects.first().id)
        }
        response = self.client.post('/api/admin/locations/', data, format='json')
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content)
        self.assertIsInstance(
            Location.objects.get(id=new_uuid),
            Location
        )


class LocationUpdateTests(APITestCase):

    def setUp(self):
        create_locations()
        self.location = Location.objects.get(name='ca')
        # Login
        self.person = create_person()
        self.client.login(username=self.person.username, password=PASSWORD)
        # Data
        self.data = {
            'id': str(self.location.id),
            'name': self.location.name,
            'number': self.location.number,
            'location_level': str(self.location.location_level.id),
            'status': str(self.location.status.id),
            'parents': [],
            'children': []
        }

    def tearDown(self):
        self.client.logout()

    def test_update_response(self):
        response = self.client.put('/api/admin/locations/{}/'.format(self.location.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 200)

    def test_update_name(self):
        new_name = 'ca2'
        self.assertNotEqual(new_name, self.data['name'])
        self.data['name'] = new_name
        response = self.client.put('/api/admin/locations/{}/'.format(self.location.id),
            self.data, format='json')
        data = json.loads(response.content)
        self.assertEqual(data['name'], new_name)

    def test_update_status(self):
        new_status = mommy.make(LocationStatus, name='new_status')
        self.data['status'] = str(new_status.id)
        response = self.client.put('/api/admin/locations/{}/'.format(self.location.id),
            self.data, format='json')
        data = json.loads(response.content)
        self.assertEqual(data['status'], str(new_status.id))














