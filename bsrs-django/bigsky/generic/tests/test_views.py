import json
import uuid

from django.core.urlresolvers import reverse

from model_mommy import mommy
from rest_framework.test import APITestCase
from rest_framework.exceptions import ValidationError

from generic.models import SavedSearch
from generic.serializers import SavedSearchSerializer
from person.tests.factory import PASSWORD, create_single_person, create_role, create_person


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

#     ### util.UniqueForActiveValidator - two key tests

    def test_unique_for_active_two_keys(self):
        serializer = SavedSearchSerializer(self.saved_search)
        data = serializer.data
        data['id'] = str(uuid.uuid4())
        response = self.client.post('/api/admin/generic/', data=data, format='json')
        self.assertEqual(response.status_code, 400)

    def test_unique_for_active_two_keys_deleted(self):
        # Ignore deleted models when checking for uniqueness
        self.saved_search.delete()
        serializer = SavedSearchSerializer(self.saved_search)
        data = serializer.data
        data['id'] = str(uuid.uuid4())
        response = self.client.post('/api/admin/generic/', data=data, format='json')
        self.assertEqual(response.status_code, 201)


class ExportDataTests(APITestCase):

    def setUp(self):
        # Role
        self.role = create_role()
        self.person = create_single_person(name='aaron', role=self.role)
        create_person(_many=10)
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_get(self):
        response = self.client.get(reverse("export_data"))
        self.assertEqual(response.status_code, 404)

    def test_post_bad_data(self):
        data = {
            'app_name': 'person',
            'model_name': 'person'
        }
        response = self.client.post(reverse("export_data"), data)
        self.assertEqual(response.status_code, 400)
