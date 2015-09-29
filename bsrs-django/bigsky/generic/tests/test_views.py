import json
import uuid

from model_mommy import mommy
from rest_framework.test import APITestCase

from generic.models import SavedSearch
from generic.serializers import SavedSearchSerializer
from person.models import Person, Role
from person.tests.factory import PASSWORD, create_single_person, create_role


class SavedSearchTests(APITestCase):

    def setUp(self):
        # Role
        self.role = create_role()
        self.person = create_single_person(name='aaron', role=self.role)
        self.client.login(username=self.person.username, password=PASSWORD)
        self.saved_search = mommy.make(SavedSearch, person=self.person,
            endpoint_name='admin.people.index')

    def tearDown(self):
        self.client.logout()

    def test_create(self):
        data = {
            "id": str(uuid.uuid4()),
            "name": "my new search",
            "person": str(self.person.id),
            "endpoint_name": self.saved_search.endpoint_name,
            "endpoint_uri": "/api/admin/phone_numbers/"
        }
        response = self.client.post('/api/admin/generic/', data, format='json')
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content)
        self.assertIsInstance(SavedSearch.objects.get(id=data['id']), SavedSearch)

    def test_list(self):
        response = self.client.get('/api/admin/generic/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['endpoint_name'], self.saved_search.endpoint_name)

    def test_detail(self):
        response = self.client.get('/api/admin/generic/{}/'.format(self.saved_search.id))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['id'], str(self.saved_search.id))

    def test_update(self):
        # Setup
        serializer = SavedSearchSerializer(self.saved_search)
        data = serializer.data
        data['endpoint_uri'] = "/api/admin/emails/?ordering=-email"
        # test
        response = self.client.put('/api/admin/generic/{}/'.format(self.saved_search.id),
            data=data, format='json')
        self.assertEqual(response.status_code, 200)
        new_data = json.loads(response.content)
        self.assertEqual(data['endpoint_uri'], new_data['endpoint_uri'])
