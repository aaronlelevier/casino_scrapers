import uuid
import json

from django.db.models import Q

from rest_framework.test import APITestCase
from model_mommy import mommy

from contact.models import Address
from location.tests.factory import create_location_levels, create_locations
from location.models import (Location, LocationLevel, LocationStatus,
    LocationType)
from location.serializers import (LocationCreateSerializer,
    LocationUpdateSerializer)
from person.tests.factory import create_person, PASSWORD
from utils import create
from utils.create import _generate_chars


### LOCATION LEVEL

class LocationLevelTests(APITestCase):

    def setUp(self):
        create_location_levels()
        self.region = LocationLevel.objects.get(name='region')
        self.district = LocationLevel.objects.get(name='district')
        self.store = LocationLevel.objects.get(name='store')
        # Login
        self.person = create_person()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    ### LIST

    def test_list(self):
        response = self.client.get('/api/admin/location_levels/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
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
        data = json.loads(response.content.decode('utf8'))
        self.assertIn(
            LocationLevel.objects.get(id=data['parents'][0]['id']),
            self.district.parents.all()
        )

    def test_get_children(self):
        response = self.client.get('/api/admin/location_levels/{}/'.format(self.district.id))
        data = json.loads(response.content.decode('utf8'))
        self.assertIn(
            LocationLevel.objects.get(id=data['children'][0]),
            self.district.children.all()
        )

    ### CREATE

    def test_create(self):
        new_name = 'region_lp'
        child_location_level = mommy.make(LocationLevel)
        data = {
            'id': str(uuid.uuid4()),
            'name': new_name,
            'children': [str(child_location_level.id)]
        }
        response = self.client.post('/api/admin/location_levels/', data, format='json')
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content.decode('utf8'))
        self.assertIsInstance(LocationLevel.objects.get(id=data['id']), LocationLevel)
        self.assertEqual(data['children'][0], str(child_location_level.id))

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
        data = json.loads(response.content.decode('utf8'))
        self.assertNotEqual(data['name'], old_name)

    ### DETAIL ROUTES

    def test_get_all_children(self):
        region = LocationLevel.objects.get(name='region')
        response = self.client.get('/api/admin/location_levels/{}/get-all-children/'.format(region.id), format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            len(data),
            LocationLevel.objects.get_all_children(region).count()
        )

    def test_get_all_parents(self):
        department = LocationLevel.objects.get(name='department')
        response = self.client.get('/api/admin/location_levels/{}/get-all-parents/'.format(department.id), format='json')
        data = json.loads(response.content.decode('utf8'))
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
        response = self.client.get('/api/admin/location_levels/')
        data = json.loads(response.content.decode('utf8'))
        self.assertNotIn(
            str(self.district.id),
            [d['id'] for d in data['results']]
        )

    def test_delete_children(self):
        response = self.client.delete('/api/admin/location_levels/{}/'.format(self.district.id))
        self.assertTrue(LocationLevel.objects_all.get(id=self.district.id).deleted)
        response = self.client.get('/api/admin/location_levels/{}/'.format(self.region.id))
        data = json.loads(response.content.decode('utf8'))
        self.assertNotIn(
            str(self.district.id),
            [ea for ea in data['children']]
        )

    def test_delete_parent(self):
        response = self.client.delete('/api/admin/location_levels/{}/'.format(self.district.id))
        self.assertTrue(LocationLevel.objects_all.get(id=self.district.id).deleted)
        response = self.client.get('/api/admin/location_levels/{}/'.format(self.store.id))
        data = json.loads(response.content.decode('utf8'))
        self.assertNotIn(
            str(self.district.id),
            [ea['id'] for ea in data['parents']]
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
        self.location_status = mommy.make(LocationStatus)
        self.location.status = self.location_status
        self.location.save()
        # Login
        self.person = create_person()
        self.client.login(username=self.person.username, password=PASSWORD)
        # Response / data
        self.response = self.client.get('/api/admin/locations/')
        self.data = json.loads(self.response.content.decode('utf8'))
        self.data_location = self.data['results'][0]

    def tearDown(self):
        self.client.logout()

    def test_list(self):
        self.assertEqual(self.response.status_code, 200)

    def test_list_status(self):
        self.assertIsInstance(
            LocationStatus.objects.get(id=self.data['results'][0]['status']['id']),
            LocationStatus
        )

    def test_list_location_level(self):
        self.assertIsInstance(
            LocationLevel.objects.get(id=self.data['results'][0]['location_level']['id']),
            LocationLevel
        )

    def test_keys(self):
        self.assertEqual(len(self.data_location), 5)

    def test_nested(self):
        self.assertTrue(self.data_location['status']['id'])
        self.assertTrue(self.data_location['location_level']['id'])


class LocationDetailTests(APITestCase):

    def setUp(self):
        create_locations()
        self.location = Location.objects.get(name='ca')
        # Login
        self.person = create_person()
        self.client.login(username=self.person.username, password=PASSWORD)
        # Response / Data
        self.response = self.client.get('/api/admin/locations/{}/'.format(self.location.id))
        self.data = json.loads(self.response.content.decode('utf8'))

    def tearDown(self):
        self.client.logout()

    def test_get(self):
        self.assertEqual(self.response.status_code, 200)

    def test_location_level(self):
        self.assertIsInstance(
            LocationLevel.objects.get(id=self.data['location_level']['id']),
            LocationLevel
        )

    def test_location_level_nested(self):
        self.assertTrue(self.data['location_level']['parents'][0]['id'])
        self.assertTrue(self.data['location_level']['children'][0])

    def test_get_status(self):
        self.assertIsInstance(
            LocationStatus.objects.get(id=self.data['status']),
            LocationStatus
        )

    def test_get_parents(self):
        self.assertIn(
            Location.objects.get(id=self.data['parents'][0]['id']),
            self.location.parents.all()
        )

    def test_get_children(self):
        self.assertIn(
            Location.objects.get(id=self.data['children'][0]['id']),
            self.location.children.all()
        )

    def test_keys(self):
        self.assertEqual(len(self.data), 7)

    ### DETAIL ROUTES

    def test_get_level_children(self):
        # SetUp
        location = Location.objects.get(name='east')
        location_level = LocationLevel.objects.get(name='store')
        # Test
        response = self.client.get('/api/admin/locations/{pk}/get-level-children/{level_id}/'.format(
            pk=location.id, level_id=location_level.id))
        data = json.loads(response.content.decode('utf8'))
        store1 = Location.objects.filter(location_level=location_level).first()
        self.assertIn(str(store1.id), response.content.decode('utf8'))
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
        data = json.loads(response.content.decode('utf8'))
        region1 = Location.objects.filter(location_level=location_level).first()
        self.assertIn(str(region1.id), response.content.decode('utf8'))
        self.assertEqual(len(data), 2)


class LocationCreateTests(APITestCase):

    def setUp(self):
        create_locations()
        self.location = Location.objects.get(name='ca')
        # Login
        self.person = create_person()
        self.client.login(username=self.person.username, password=PASSWORD)
        # Data: base data to update unique fields on and POST to test CREATEs
        serializer = LocationCreateSerializer(self.location)
        self.data = serializer.data

    def tearDown(self):
        self.client.logout()

    def test_create(self):
        self.data.update({
            'id': str(uuid.uuid4()),
            'number': create._generate_chars()
        })
        response = self.client.post('/api/admin/locations/', self.data, format='json')
        self.assertEqual(response.status_code, 201)

    def test_create_unique_for_active_active(self):
        self.assertTrue(self.data['number'])
        self.data.update({
            'id': str(uuid.uuid4()),
            'number': Location.objects.exclude(number=self.data['number']).first().number
        })
        response = self.client.post('/api/admin/locations/', self.data, format='json')
        self.assertEqual(response.status_code, 400)

    def test_create_unique_for_active_deleted(self):
        # delete the "old_location", so it will be fine to re-use it's ``number``
        self.assertTrue(self.data['number'])
        old_location = Location.objects.exclude(number=self.data['number']).first()
        old_location.delete()
        # Requery Update Serializer Data b/c children/parents may have changed 
        # when the "old_location" was deleted
        self.location = Location.objects.get(id=self.location.id)
        self.data = LocationUpdateSerializer(self.location).data
        # test
        self.data.update({
            'id': str(uuid.uuid4()),
            'number': old_location.number
        })
        response = self.client.post('/api/admin/locations/', self.data, format='json')
        self.assertEqual(response.status_code, 201)


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
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['name'], new_name)

    def test_update_status(self):
        new_status = mommy.make(LocationStatus, name='new_status')
        self.data['status'] = str(new_status.id)
        response = self.client.put('/api/admin/locations/{}/'.format(self.location.id),
            self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['status'], str(new_status.id))

    def test_update_parents(self):
        new_location = mommy.make(Location)
        self.data['parents'] = [str(new_location.id)]
        self.assertNotEqual(new_location.location_level, self.location.location_level)
        response = self.client.put('/api/admin/locations/{}/'.format(self.location.id),
            self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        # ['parents'][0] is equal to an UUID here b/c 'parents' is an UUID Array
        self.assertEqual(data['parents'][0], str(new_location.id))

    def test_update_parents_same_location_level(self):
        # This should raise a ValidationError (400) b/c Parents/Children can't 
        # have the same LocationLevel as the Location
        new_location = mommy.make(Location, location_level=self.location.location_level)
        self.data['parents'] = [str(new_location.id)]
        response = self.client.put('/api/admin/locations/{}/'.format(self.location.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 400)

    def test_update_children(self):
        new_location = mommy.make(Location)
        self.data['children'] = [str(new_location.id)]
        self.assertNotEqual(new_location.location_level, self.location.location_level)
        response = self.client.put('/api/admin/locations/{}/'.format(self.location.id),
            self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['children'][0], str(new_location.id))

    def test_update_children_same_location_level(self):
        # This should raise a ValidationError (400) b/c Parents/Children can't 
        # have the same LocationLevel as the Location
        new_location = mommy.make(Location, location_level=self.location.location_level)
        self.data['children'] = [str(new_location.id)]
        response = self.client.put('/api/admin/locations/{}/'.format(self.location.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 400)

    ### util.UniqueForActiveValidator - tests

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


class LocationDeleteTests(APITestCase):

    def setUp(self):
        create_locations()
        self.region_location = Location.objects.get(name='east')
        self.district_location = Location.objects.get(name='ca')
        self.store_location = Location.objects.get(name='san_diego')
        # Login
        self.person = create_person()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_delete(self):
        response = self.client.delete('/api/admin/locations/{}/'.format(self.district_location.id))
        self.assertEqual(response.status_code, 204)
        # Not in Detail
        response = self.client.get('/api/admin/locations/{}/'.format(self.district_location.id))
        self.assertEqual(response.status_code, 404)
        self.assertTrue(Location.objects_all.filter(id=self.district_location.id).exists())
        # Not in List
        response = self.client.get('/api/admin/locations/')
        data = json.loads(response.content.decode('utf8'))
        self.assertNotIn(
            str(self.district_location.id),
            [d['id'] for d in data['results']]
        )

    def test_delete_children(self):
        response = self.client.delete('/api/admin/locations/{}/'.format(self.district_location.id))
        self.assertTrue(Location.objects_all.get(id=self.district_location.id).deleted)
        response = self.client.get('/api/admin/locations/{}/'.format(self.region_location.id))
        data = json.loads(response.content.decode('utf8'))
        self.assertNotIn(
            str(self.district_location.id),
            [ea['id'] for ea in data['children']]
        )

    def test_delete_parent(self):
        response = self.client.delete('/api/admin/locations/{}/'.format(self.district_location.id))
        self.assertTrue(Location.objects_all.get(id=self.district_location.id).deleted)
        response = self.client.get('/api/admin/locations/{}/'.format(self.store_location.id))
        data = json.loads(response.content.decode('utf8'))
        self.assertNotIn(
            str(self.district_location.id),
            [ea['id'] for ea in data['parents']]
        )

    def test_delete_override(self):
        response = self.client.delete('/api/admin/locations/{}/'.format(self.district_location.id),
            {'override': True}, format='json')
        self.assertEqual(response.status_code, 204)
        response = self.client.get('/api/admin/locations/{}/'.format(self.district_location.id))
        self.assertEqual(response.status_code, 404)
        self.assertFalse(Location.objects_all.filter(id=self.district_location.id).exists())


class LocationOrderingTests(APITestCase):

    def setUp(self):
        # Login
        self.person = create_person()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_case_insensitive(self):
        # Setup
        mommy.make(Location, name='Z')
        mommy.make(Location, name='a')
        # test:
        response = self.client.get('/api/admin/locations/?ordering=name') 
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data["results"][0]["name"], "a")
        self.assertEqual(data["results"][1]["name"], "Z")

    def test_case_insensitive_reverse(self):
        # Setup
        mommy.make(Location, name='Z')
        mommy.make(Location, name='a')
        # test: expect = B,a,A
        response = self.client.get('/api/admin/locations/?ordering=-name')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data["results"][0]["name"], "Z")
        self.assertEqual(data["results"][1]["name"], "a")

    def test_two_fields(self):
        # Setup
        mommy.make(Location, name='Z', number='1')
        mommy.make(Location, name='a', number='2')
        mommy.make(Location, name='a', number='1')
        # test
        response = self.client.get('/api/admin/locations/?ordering=number,name')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data["results"][0]["number"], "1")
        self.assertEqual(data["results"][0]["name"], "a")
        self.assertEqual(data["results"][1]["number"], "1")
        self.assertEqual(data["results"][1]["name"], "Z")

    def test_two_fields_reverse(self):
        # Setup
        mommy.make(Location, name='Z', number='1')
        mommy.make(Location, name='a', number='2')
        mommy.make(Location, name='a', number='1')
        # test
        response = self.client.get('/api/admin/locations/?ordering=-number,name')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data["results"][0]["number"], "2")
        self.assertEqual(data["results"][0]["name"], "a")
        self.assertEqual(data["results"][1]["number"], "1")
        self.assertEqual(data["results"][1]["name"], "a")


class LocationSearchTests(APITestCase):

    def setUp(self):
        create_locations()
        self.location = Location.objects.get(name='ca')
        self.location_level = self.location.location_level
        # Login
        self.person = create_person()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_search_name(self):
        letter = "a"
        response = self.client.get('/api/admin/locations/?search={}'.format(letter))
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data["count"],
            Location.objects.filter(
                Q(name__icontains=letter) | Q(number__icontains=letter)
                ).count()
        )

    def test_search_address_city(self):
        city = "San Diego"
        address = mommy.make(Address, city=city, location=self.location)
        response = self.client.get('/api/admin/locations/?search={}'.format(city))
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['results'][0]['id'],
            str(address.location.id)
        )

    def test_search_address_postal_code(self):
        postal_code = "90210"
        address = mommy.make(Address, postal_code=postal_code, location=self.location)
        response = self.client.get('/api/admin/locations/?search={}'.format(postal_code))
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['results'][0]['id'],
            str(address.location.id)
        )

    def test_search_address_address(self):
        address = "123 Fern St."
        address = mommy.make(Address, address="Fern", location=self.location)
        response = self.client.get('/api/admin/locations/?search={}'.format(address))
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['results'][0]['id'],
            str(address.location.id)
        )


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
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['count'],
            Location.objects.filter(location_level=self.location_level).count()
        )

    def test_location_level_filter_by_name(self):
        # 3 locations total: [c, ca, cat]
        c = mommy.make(Location, number=_generate_chars(),
            location_level=self.location_level, name='c')
        cat = mommy.make(Location, number=_generate_chars(),
            location_level=self.location_level, name='cat')
        # filter by "c" gets 3
        name = "c"
        response = self.client.get('/api/admin/locations/?location_level={}&name__icontains={}'
            .format(self.location_level.id, name))
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['count'],
            Location.objects.filter(location_level=self.location_level, name__icontains=name).count()
        )

        # filter by "ca" gets 2
        name = "ca"
        response = self.client.get('/api/admin/locations/?location_level={}&name__icontains={}'
            .format(self.location_level.id, name))
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['count'],
            Location.objects.filter(location_level=self.location_level, name__icontains=name).count()
        )