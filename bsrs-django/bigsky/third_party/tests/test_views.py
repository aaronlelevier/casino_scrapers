import json
import uuid

from model_mommy import mommy
from rest_framework.test import APITestCase

from third_party.models import ThirdParty
from rest_framework import status
from third_party.serializers import ThirdPartySerializer
from third_party.tests.factory import create_third_parties
from person.tests.factory import PASSWORD, create_person


### THIRD PARTY

class ThirdPartyListTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        # ThirdParty
        create_third_parties()
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_response(self):
        response = self.client.get('/api/admin/third-parties/')
        self.assertEqual(response.status_code, 200)

    def test_data(self):
        response = self.client.get('/api/admin/third-parties/')
        data = json.loads(response.content.decode('utf8'))
        self.assertTrue(len(data['results']) > 0)


class ThirdPartyDetailTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        # ThirdParty
        create_third_parties()
        self.third_party = ThirdParty.objects.first()
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_detail(self):
        response = self.client.get('/api/admin/third-parties/{}/'.format(self.third_party.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.third_party.id))


class ThirdPartyUpdateTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        # ThirdParty
        create_third_parties()
        self.third_party = ThirdParty.objects.first()
        # Data
        serializer = ThirdPartySerializer(self.third_party)
        self.data = serializer.data
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_no_change(self):
        response = self.client.put('/api/admin/third-parties/{}/'.format(self.third_party.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 200)

    def test_change_name(self):
        self.data['number'] = '123-232-2322'
        response = self.client.put('/api/admin/third-parties/{}/'.format(self.third_party.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertNotEqual(self.third_party.number, data['number'])


class ThirdPartyCreateTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        # ThirdParty
        create_third_parties()
        self.third_party = ThirdParty.objects.first()
        # Data
        serializer = ThirdPartySerializer(self.third_party)
        self.data = serializer.data
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_create(self):
        self.data.update({
            'id': str(uuid.uuid4()),
            'name': 'scooter',
            'number': '123-123-1233',
            })
        response = self.client.post('/api/admin/third-parties/', self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201)
        self.assertIsInstance(ThirdParty.objects.get(id=data['id']), ThirdParty)




