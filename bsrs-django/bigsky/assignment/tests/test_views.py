import json
import uuid

from model_mommy import mommy
from rest_framework.test import APITestCase

from assignment.models import Profile
from assignment.serializers import ProfileCreateUpdateSerializer
from assignment.tests.factory import create_profile
from person.tests.factory import create_single_person, PASSWORD
from utils.create import _generate_chars


class ViewTests(APITestCase):

    def setUp(self):
        self.person = create_single_person()
        self.profile = mommy.make(Profile, assignee=self.person)

        self.data = ProfileCreateUpdateSerializer(self.profile).data

        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_list(self):
        response = self.client.get('/api/admin/profiles/')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        data = data['results'][0]
        self.assertEqual(data['id'], str(self.profile.id))
        self.assertEqual(data['description'], self.profile.description)
        self.assertEqual(data['assignee']['id'], str(self.profile.assignee.id))
        self.assertEqual(data['assignee']['username'], self.profile.assignee.username)

    def test_detail(self):
        response = self.client.get('/api/admin/profiles/{}/'.format(self.profile.id))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.profile.id))
        self.assertEqual(data['description'], self.profile.description)
        self.assertEqual(data['assignee']['id'], str(self.profile.assignee.id))
        self.assertEqual(data['assignee']['username'], self.profile.assignee.username)

    def test_create(self):
        self.data['id'] = str(uuid.uuid4())
        self.data['description'] = 'foo'

        response = self.client.post('/api/admin/profiles/', self.data, format='json')

        self.assertEqual(response.status_code, 201)
        profile = Profile.objects.get(id=self.data['id'])
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(profile.id))
        self.assertEqual(data['description'], profile.description)
        self.assertEqual(data['assignee'], str(profile.assignee.id))

    def test_update(self):
        assignee = create_single_person()
        self.data.update({
            'description': 'foo',
            'assignee': str(assignee.id)
        })

        response = self.client.put('/api/admin/profiles/{}/'.format(self.profile.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], self.data['id'])
        self.assertEqual(data['description'], self.data['description'])
        self.assertEqual(data['assignee'], self.data['assignee'])

    def test_search(self):
        self.profile_two = create_profile(_generate_chars())
        self.profile_three = create_profile(_generate_chars())
        self.assertEqual(Profile.objects.count(), 3)
        keyword = self.profile_two.description

        response = self.client.get('/api/admin/profiles/?search={}'.format(keyword))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
