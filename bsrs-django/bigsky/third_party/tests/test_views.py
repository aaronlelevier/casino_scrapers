import json
import uuid

from rest_framework.test import APITestCase

from contact.models import Email, EmailType
from person.tests.factory import PASSWORD, create_person
from third_party.models import ThirdParty
from third_party.serializers import ThirdPartyCreateUpdateSerializer
from third_party.tests.factory import create_third_party


class ThirdPartyTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        # ThirdParty
        self.third_party = create_third_party()
        # Data
        serializer = ThirdPartyCreateUpdateSerializer(self.third_party)
        self.data = serializer.data
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    ### LIST

    def test_list_response(self):
        response = self.client.get('/api/admin/third-parties/')
        self.assertEqual(response.status_code, 200)

    def test_list_data(self):
        response = self.client.get('/api/admin/third-parties/')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['id'], str(self.third_party.id))

    ### DETAIL

    def test_detail(self):
        response = self.client.get('/api/admin/third-parties/{}/'.format(self.third_party.id))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.third_party.id))

    def test_detail_contact(self):
        response = self.client.get('/api/admin/third-parties/{}/'.format(self.third_party.id))
        data = json.loads(response.content.decode('utf8'))
        self.assertIsInstance(
            Email.objects.get(id=data['emails'][0]['id']),
            Email
        )

    def test_detail_contact_type(self):
        response = self.client.get('/api/admin/third-parties/{}/'.format(self.third_party.id))
        data = json.loads(response.content.decode('utf8'))
        self.assertIsInstance(
            EmailType.objects.get(id=data['emails'][0]['type']['id']),
            EmailType
        )

    ### UPDATE

    def test_update_no_change(self):
        response = self.client.put('/api/admin/third-parties/{}/'.format(self.third_party.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 200)

    def test_update_change_name(self):
        self.data['number'] = '123-232-2322'
        response = self.client.put('/api/admin/third-parties/{}/'.format(self.third_party.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertNotEqual(self.third_party.number, data['number'])
        self.assertIsInstance(Email.objects.get(id=data['emails'][0]['id']), Email)
        self.assertIsInstance(EmailType.objects.get(id=data['emails'][0]['type']), EmailType)

    ### CREATE

    def test_create(self):
        data = {
            'id': str(uuid.uuid4()),
            'name': 'scooter',
            'number': '123-123-1233'
        }
        response = self.client.post('/api/admin/third-parties/', data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201)
        self.assertIsInstance(ThirdParty.objects.get(id=data['id']), ThirdParty)
