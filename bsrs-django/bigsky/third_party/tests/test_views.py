import json

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
