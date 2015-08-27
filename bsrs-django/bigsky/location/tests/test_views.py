import uuid
import json

from rest_framework.test import APITestCase
from model_mommy import mommy

from location.tests.factory import create_location_levels, create_locations
from location.models import (Location, LocationLevel, LocationStatus,
    LocationType)
from location.serializers import (LocationCreateSerializer,
    LocationUpdateSerializer)
from person.tests.factory import create_person, PASSWORD
from util import create


### LOCATION LEVEL

class LocationLevelTests(APITestCase):

    def setUp(self):
        create_location_levels()
        self.region = LocationLevel.objects.get(name='region')
        self.district = LocationLevel.objects.get(name='district')
        # Login
        self.person = create_person()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    ### LIST

    def test_list(self):
        response = self.client.get('/api/admin/location_levels/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertIsInstance(
            LocationLevel.objects.get(id=data['results'][0]['id']),
            LocationLevel
        )

    ### GET

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

    ### CREATE

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

    ### UPDATE

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

    ### DETAIL ROUTES

    def test_get_all_children(self):
        region = LocationLevel.objects.get(name='region')
        response = self.client.get('/api/admin/location_levels/{}/get-all-children/'.format(region.id), format='json')
        data = json.loads(response.content)
        self.assertEqual(
            len(data),
            LocationLevel.objects.get_all_children(region).count()
        )

    def test_get_all_parents(self):
        department = LocationLevel.objects.get(name='department')
        response = self.client.get('/api/admin/location_levels/{}/get-all-parents/'.format(department.id), format='json')
        data = json.loads(response.content)
        self.assertEqual(
            len(data),
            LocationLevel.objects.get_all_parents(department).count()
        )

    ### DELETE
    # Do delete's behave differently because they are 'self-referencing'?

    def test_delete(self):
        response = self.client.delete('/api/admin/location_levels/{}/'.format(self.district.id))
        self.assertEqual(response.status_code, 204)
        response = self.client.get('/api/admin/location_levels/{}/'.format(self.district.id))
        self.assertEqual(response.status_code, 404)

    def test_delete_children(self):
        response = self.client.delete('/api/admin/location_levels/{}/'.format(self.district.id))
        self.assertTrue(LocationLevel.objects_all.get(id=self.district.id).deleted)
        response = self.client.get('/api/admin/location_levels/{}/'.format(self.region.id))
        data = json.loads(response.content)
        self.assertNotIn(
            str(self.district.id),
            [ea['id'] for ea in data['children']]
        )

    def test_delete_override(self):
        response = self.client.delete('/api/admin/location_levels/{}/'.format(self.district.id),
            {'override': True}, format='json')
        self.assertEqual(response.status_code, 204)
        response = self.client.get('/api/admin/location_levels/{}/'.format(self.district.id))
        self.assertEqual(response.status_code, 404)


### LOCATION

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
        location = Location.objects.get(name='east')
        location_level = LocationLevel.objects.get(name='store')
        # Test
        response = self.client.get('/api/admin/locations/{pk}/get-level-children/{level_id}/'.format(
            pk=location.id, level_id=location_level.id))
        data = json.loads(response.content)
        store1 = Location.objects.filter(location_level=location_level).first()
        self.assertIn(str(store1.id), response.content)
        self.assertEqual(len(data), 2)

    def test_get_level_parents(self):
        # SetUp
        location = Location.objects.get(name='ca')
        location_level = LocationLevel.objects.get(name='region')
        # New Parent Location at "region" Level
        east_lp = mommy.make(Location, location_level=location_level, name='east_lp')
        east_lp.children.add(location)
        # Test
        response = self.client.get('/api/admin/locations/{pk}/get-level-parents/{level_id}/'.format(
            pk=location.id, level_id=location_level.id))
        data = json.loads(response.content)
        region1 = Location.objects.filter(location_level=location_level).first()
        self.assertIn(str(region1.id), response.content)
        self.assertEqual(len(data), 2)


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
        # setup
        serializer = LocationCreateSerializer(self.location)
        data = serializer.data
        new_uuid = str(uuid.uuid4())
        data.update({
            'id': new_uuid,
            'number': create._generate_chars()
        })
        # Test
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
        serializer = LocationUpdateSerializer(self.location)
        self.data = serializer.data

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


class DRFFiltersTests(APITestCase):

    def setUp(self):
        create_locations()
        self.location = Location.objects.get(name='ca')
        self.location_level = self.location.location_level
        # Login
        self.person = create_person()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_location_level_filter(self):
        response = self.client.get('/api/admin/locations/?location_level={}'
            .format(self.location_level.id))
        data = json.loads(response.content)
        self.assertEqual(
            data['count'],
            Location.objects.filter(location_level=self.location_level).count()
        )