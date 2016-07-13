import json
import uuid

from model_mommy import mommy
from rest_framework.test import APITestCase

from routing.models import Assignment
from routing.serializers import AssignmentCreateUpdateSerializer
from routing.tests.factory import create_assignment, create_profile_filter
from person.tests.factory import create_single_person, PASSWORD
from utils.create import _generate_chars


class ViewTests(APITestCase):

    def setUp(self):
        self.person = create_single_person()
        self.assignment = mommy.make(Assignment, assignee=self.person)
        self.profile_filter = create_profile_filter(self.assignment)

        self.data = AssignmentCreateUpdateSerializer(self.assignment).data

        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_list(self):
        response = self.client.get('/api/admin/assignments/')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        data = data['results'][0]
        self.assertEqual(data['id'], str(self.assignment.id))
        self.assertEqual(data['description'], self.assignment.description)
        self.assertEqual(data['assignee']['id'], str(self.assignment.assignee.id))
        self.assertEqual(data['assignee']['username'], self.assignment.assignee.username)

    def test_detail(self):
        response = self.client.get('/api/admin/assignments/{}/'.format(self.assignment.id))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.assignment.id))
        self.assertEqual(data['description'], self.assignment.description)
        self.assertEqual(data['assignee']['id'], str(self.assignment.assignee.id))
        self.assertEqual(data['assignee']['username'], self.assignment.assignee.username)
        # profile_filter
        self.assertEqual(len(data['filters']), 1)
        self.assertEqual(data['filters'][0]['id'], str(self.profile_filter.id))
        self.assertEqual(data['filters'][0]['context'], self.profile_filter.context)
        self.assertEqual(data['filters'][0]['field'], self.profile_filter.field)
        self.assertEqual(data['filters'][0]['criteria'], self.profile_filter.criteria)

    def test_create(self):
        self.data['id'] = str(uuid.uuid4())
        self.data['description'] = 'foo'

        response = self.client.post('/api/admin/assignments/', self.data, format='json')

        self.assertEqual(response.status_code, 201)
        assignment = Assignment.objects.get(id=self.data['id'])
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(assignment.id))
        self.assertEqual(data['description'], assignment.description)
        self.assertEqual(data['assignee'], str(assignment.assignee.id))

    def test_update(self):
        assignee = create_single_person()
        self.data.update({
            'description': 'foo',
            'assignee': str(assignee.id)
        })

        response = self.client.put('/api/admin/assignments/{}/'.format(self.assignment.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], self.data['id'])
        self.assertEqual(data['description'], self.data['description'])
        self.assertEqual(data['assignee'], self.data['assignee'])

    def test_search(self):
        self.assignment_two = create_assignment(_generate_chars())
        self.assignment_three = create_assignment(_generate_chars())
        self.assertEqual(Assignment.objects.count(), 3)
        keyword = self.assignment_two.description

        response = self.client.get('/api/admin/assignments/?search={}'.format(keyword))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
