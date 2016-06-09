import json
import uuid

from django.test import TestCase

from model_mommy import mommy
from rest_framework.test import APITestCase

from assignment.models import Profile
from assignment.serializers import ProfileListSerializer
from person.tests.factory import create_single_person, PASSWORD


class ViewTests(APITestCase):

    def setUp(self):
        self.person = create_single_person()
        self.profile = mommy.make(Profile, assignee=self.person)

        self.data = ProfileListSerializer(self.profile).data

        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_list(self):
        response = self.client.get('/api/profiles/assignment/')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        profile = data['results'][0]
        self.assertEqual(profile['id'], str(self.profile.id))
        self.assertEqual(profile['description'], self.profile.description)
        self.assertEqual(profile['order'], self.profile.order)
        self.assertEqual(profile['assignee'], str(self.profile.assignee.id))

    def test_detail(self):
        response = self.client.get('/api/profiles/assignment/{}/'.format(self.profile.id))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.profile.id))
        self.assertEqual(data['description'], self.profile.description)
        self.assertEqual(data['order'], self.profile.order)
        self.assertEqual(data['assignee'], str(self.profile.assignee.id))

    def test_create(self):
        self.data['id'] = str(uuid.uuid4())

        response = self.client.post('/api/profiles/assignment/', self.data, format='json')

        self.assertEqual(response.status_code, 201)
        profile = Profile.objects.get(id=self.data['id'])
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(profile.id))
        self.assertEqual(data['description'], profile.description)
        self.assertEqual(data['order'], profile.order)
        self.assertEqual(data['assignee'], str(profile.assignee.id))

    def test_update(self):
        assignee = create_single_person()
        self.data.update({
            'description': 'foo',
            'order': self.data['order']+1,
            'assignee': str(assignee.id)
        })

        response = self.client.put('/api/profiles/assignment/{}/'.format(self.profile.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], self.data['id'])
        self.assertEqual(data['description'], self.data['description'])
        self.assertEqual(data['order'], self.data['order'])
        self.assertEqual(data['assignee'], self.data['assignee'])
