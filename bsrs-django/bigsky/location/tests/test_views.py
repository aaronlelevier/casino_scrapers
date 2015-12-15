import uuid
import json

from rest_framework.test import APITestCase
from model_mommy import mommy

from contact.models import Address, PhoneNumber, PhoneNumberType
from contact.tests.factory import create_contact, create_contacts
from location.tests.factory import create_location_levels, create_locations
from location.models import Location, LocationLevel, LocationStatus
from location.serializers import (LocationCreateSerializer,
    LocationUpdateSerializer)
from person.tests.factory import create_person, PASSWORD
from utils import create


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

    def test_list_response(self):
        response = self.client.get('/api/admin/location-levels/')

        self.assertEqual(response.status_code, 200)

    def test_list_data(self):
        response = self.client.get('/api/admin/location-levels/')

        data = json.loads(response.content.decode('utf8'))
        location_level = LocationLevel.objects.get(id=data['results'][0]['id'])
        
        self.assertEqual(data['results'][0]['id'], str(location_level.id))
        self.assertEqual(data['results'][0]['name'], location_level.name)

    ### GET

    def test_get_response(self):
        response = self.client.get('/api/admin/location-levels/{}/'.format(self.district.id))
        
        self.assertEqual(response.status_code, 200)

    def test_get_data(self):
        response = self.client.get('/api/admin/location-levels/{}/'.format(self.district.id))
        
        data = json.loads(response.content.decode('utf8'))
        location_level = LocationLevel.objects.get(id=data['id'])

        self.assertEqual(data['id'], str(location_level.id))
        self.assertEqual(data['name'], location_level.name)

    def test_get_parents(self):
        response = self.client.get('/api/admin/location-levels/{}/'.format(self.district.id))
        data = json.loads(response.content.decode('utf8'))
        self.assertIn(
            LocationLevel.objects.get(id=data['parents'][0]),
            self.district.parents.all()
        )
        parent = self.district.parents.get(id=data['parents'][0])

    def test_get_children(self):
        response = self.client.get('/api/admin/location-levels/{}/'.format(self.district.id))
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

        response = self.client.post('/api/admin/location-levels/', data, format='json')

        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content.decode('utf8'))
        new_location_level = LocationLevel.objects.get(id=data['id'])
        self.assertEqual(data['id'], str(new_location_level.id))
        self.assertEqual(data['name'], new_location_level.name)
        self.assertIn(
            data['children'][0],
            [str(id) for id in new_location_level.children.values_list('id', flat=True)]
        )

    ### UPDATE

    def test_update(self):
        region = LocationLevel.objects.get(name='region')
        old_name = region.name
        data = {
            'id': str(region.id),
            'name': 'new_name',
            'children': [str(r.id) for r in region.children.all()]
        }
        response = self.client.put('/api/admin/location-levels/{}/'.format(region.id), data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertNotEqual(data['name'], old_name)

    ### DETAIL ROUTES

    def test_get_all_children(self):
        region = LocationLevel.objects.get(name='region')
        response = self.client.get('/api/admin/location-levels/{}/get-all-children/'.format(region.id), format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            len(data),
            LocationLevel.objects.get_all_children(region).count()
        )

    def test_get_all_parents(self):
        department = LocationLevel.objects.get(name='department')
        response = self.client.get('/api/admin/location-levels/{}/get-all-parents/'.format(department.id), format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            len(data),
            LocationLevel.objects.get_all_parents(department).count()
        )

    ### DELETE
    # Do delete's behave differently because they are 'self-referencing'?

    def test_delete(self):
        response = self.client.delete('/api/admin/location-levels/{}/'.format(self.district.id))
        self.assertEqual(response.status_code, 204)
        response = self.client.get('/api/admin/location-levels/{}/'.format(self.district.id))
        self.assertEqual(response.status_code, 404)
        response = self.client.get('/api/admin/location-levels/')
        data = json.loads(response.content.decode('utf8'))
        self.assertNotIn(
            str(self.district.id),
            [d['id'] for d in data['results']]
        )

    def test_delete_children(self):
        response = self.client.delete('/api/admin/location-levels/{}/'.format(self.district.id))
        self.assertTrue(LocationLevel.objects_all.get(id=self.district.id).deleted)
        response = self.client.get('/api/admin/location-levels/{}/'.format(self.region.id))
        data = json.loads(response.content.decode('utf8'))
        self.assertNotIn(
            str(self.district.id),
            [ea for ea in data['children']]
        )

    def test_delete_parent(self):
        response = self.client.delete('/api/admin/location-levels/{}/'.format(self.district.id))
        self.assertTrue(LocationLevel.objects_all.get(id=self.district.id).deleted)
        response = self.client.get('/api/admin/location-levels/{}/'.format(self.store.id))
        data = json.loads(response.content.decode('utf8'))
        self.assertNotIn(
            str(self.district.id),
            [ea for ea in data['parents']]
        )

    def test_delete_override(self):
        response = self.client.delete('/api/admin/location-levels/{}/'.format(self.district.id),
            {'override': True}, format='json')
        self.assertEqual(response.status_code, 204)
        response = self.client.get('/api/admin/location-levels/{}/'.format(self.district.id))
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

    def test_response(self):
        self.assertEqual(self.response.status_code, 200)

    def test_data(self):
        location = Location.objects.get(
            id=self.data['results'][0]['id'])

        self.assertEqual(self.data['results'][0]['name'], location.name)
        self.assertEqual(self.data['results'][0]['number'], location.number)

    def test_data_status(self):
        status = LocationStatus.objects.get(
            id=self.data['results'][0]['status'])
        self.assertEqual(self.data['results'][0]['status'], str(status.id))

    def test_data_location_level(self):
        location_level = LocationLevel.objects.get(
            id=self.data['results'][0]['location_level']['id'])

        self.assertEqual(self.data['results'][0]['location_level']['name'],
            location_level.name)


class LocationDetailTests(APITestCase):

    def setUp(self):
        create_locations()
        self.location = Location.objects.get(name='ca')
        create_contacts(self.location)
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

    def test_data(self):
        self.assertEqual(self.data['id'], str(self.location.id))
        self.assertEqual(self.data['name'], self.location.name)
        self.assertEqual(self.data['number'], self.location.number)
        self.assertEqual(self.data['status'], str(self.location.status.id))

    def test_location_level(self):
        self.assertIsInstance(
            LocationLevel.objects.get(id=self.data['location_level']),
            LocationLevel
        )

    def test_location_level_nested(self):
        self.assertTrue(self.data['location_level'])
        self.assertTrue(self.data['location_level'])

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
        self.assertEqual(len(self.data), 10) # b/c ph,email,addresses added

    def test_contact_nested(self):
        self.assertTrue(self.data['phone_numbers'][0]['id'])

    def test_contact_type_nested(self):
        self.assertTrue(self.data['phone_numbers'][0]['type'])

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
        self.assertEqual(len(data), 3)


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

    def test_update_children(self):
        new_location = mommy.make(Location)
        self.data['children'] = [str(new_location.id)]
        self.assertNotEqual(new_location.location_level, self.location.location_level)
        response = self.client.put('/api/admin/locations/{}/'.format(self.location.id),
            self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['children'][0], str(new_location.id))

    ### nested contacts

    def test_nested_contact_create(self):
        response = self.client.put('/api/admin/locations/{}/'.format(self.location.id),
            self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertFalse(data['phone_numbers'])
        ph_type = mommy.make(PhoneNumberType)
        ph_id = str(uuid.uuid4())
        data['phone_numbers'] = [{
            'id': ph_id,
            'number': '123',
            'type': str(ph_type.id)
        }]
        response = self.client.put('/api/admin/locations/{}/'.format(self.location.id),
            data, format='json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['phone_numbers'][0]['id'], str(ph_id))

    def test_nested_contact_update(self):
        ph = create_contact(PhoneNumber, self.location)
        serializer = LocationUpdateSerializer(self.location)
        data = serializer.data
        new_number = '456'
        data['phone_numbers'][0]['number'] = new_number
        response = self.client.put('/api/admin/locations/{}/'.format(self.location.id),
            data, format='json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['phone_numbers'][0]['number'], new_number)

    def test_nested_contact_remove(self):
        ph = create_contact(PhoneNumber, self.location)
        serializer = LocationUpdateSerializer(self.location)
        data = serializer.data
        data.pop('phone_numbers') # field is not required, so doesn't need to be sent from client-side
        response = self.client.put('/api/admin/locations/{}/'.format(self.location.id),
            data, format='json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertFalse(data['phone_numbers'])
        self.assertFalse(self.location.phone_numbers.all())

    def test_nested_contact_remove_only_endpoints_contacts(self):
        # Other contacts PHs for examle are unaffected by the nested delete, and only the
        # person at this endpoint will have thier missing contacts deleted
        location2 = Location.objects.exclude(name='ca').first()
        create_contact(PhoneNumber, location2)
        # Delete ``self.location`` PHs
        create_contact(PhoneNumber, self.location)
        serializer = LocationUpdateSerializer(self.location)
        data = serializer.data
        data.pop('phone_numbers')
        self.client.put('/api/admin/locations/{}/'.format(self.location.id), data, format='json')
        # ``location2`` still has thier PHs
        self.assertTrue(location2.phone_numbers.all())


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
        self.person.locations.all().delete()
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
        keyword = self.location.name

        response = self.client.get('/api/admin/locations/?search={}'.format(keyword))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data["count"], Location.objects.search_multi(keyword).count())

    def test_search_number(self):
        keyword = self.location.number

        response = self.client.get('/api/admin/locations/?search={}'.format(keyword))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data["count"], Location.objects.search_multi(keyword).count())

    def test_search_address_city(self):
        keyword = create._generate_chars()
        address = mommy.make(Address, city=keyword, content_object=self.location,
            object_id=self.location.id)

        response = self.client.get('/api/admin/locations/?search={}'.format(keyword))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data["count"], Location.objects.search_multi(keyword).count())

    def test_search_address_address1(self):
        keyword = create._generate_chars()
        address = mommy.make(Address, address1=keyword, content_object=self.location,
            object_id=self.location.id)

        response = self.client.get('/api/admin/locations/?search={}'.format(keyword))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data["count"], Location.objects.search_multi(keyword).count())

    def test_search_address_address2(self):
        keyword = create._generate_chars()
        address = mommy.make(Address, address2=keyword, content_object=self.location,
            object_id=self.location.id)

        response = self.client.get('/api/admin/locations/?search={}'.format(keyword))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data["count"], Location.objects.search_multi(keyword).count())

    def test_search_address_zip(self):
        keyword = create._generate_chars()
        address = mommy.make(Address, zip=keyword, content_object=self.location,
            object_id=self.location.id)

        response = self.client.get('/api/admin/locations/?search={}'.format(keyword))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data["count"], Location.objects.search_multi(keyword).count())
