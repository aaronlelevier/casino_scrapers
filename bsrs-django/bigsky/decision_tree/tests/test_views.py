import copy
import json
import uuid

from rest_framework.test import APITestCase

from decision_tree.models import TreeField, TreeOption, TreeLink, TreeData
from decision_tree.serializers import TreeDataSerializer
from decision_tree.tests.factory import create_tree_link, create_tree_field, create_tree_data
from person.tests.factory import PASSWORD, create_single_person


class TreeDataTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_single_person()
        self.client.login(username=self.person.username, password=PASSWORD)
        # models
        self.tree_data = create_tree_data()

    def tearDown(self):
        self.client.logout()

    def test_detail(self):
        response = self.client.get('/api/admin/dtd/{}/'.format(self.tree_data.id))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.tree_data.id))
        self.assertEqual(data['key'], self.tree_data.key)
        self.assertEqual(data['description'], self.tree_data.description)
        self.assertEqual(data['note'], self.tree_data.note)
        self.assertEqual(data['note_type'], self.tree_data.note_type)
        self.assertEqual(data['files'], [str(x.id) for x in self.tree_data.files.all()])
        self.assertEqual(data['prompt'], self.tree_data.prompt)
        self.assertEqual(data['link_type'], self.tree_data.link_type)
        # Fields
        self.assertEqual(len(data['fields']), 1)
        self.assertIn(data['fields'][0]['id'], [str(x.id) for x in self.tree_data.fields.all()])
        # Links
        self.assertEqual(len(data['links']), 1)
        self.assertIn(data['links'][0]['id'], [str(x.id) for x in self.tree_data.links.all()])

    def test_list(self):
        response = self.client.get('/api/admin/dtd/')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        data = data['results'][0]
        self.assertEqual(data['id'], str(self.tree_data.id))
        self.assertEqual(data['key'], self.tree_data.key)
        self.assertEqual(data['description'], self.tree_data.description)
        self.assertEqual(len(data['links']), 1)
        self.assertEqual(data['links'][0], str(self.tree_data.links.first().id))

    # def test_create(self):
    #     serializer = TreeDataSerializer(self.tree_data)
    #     raw_data = copy.copy(serializer.data)
    #     new_id = str(uuid.uuid4())
    #     raw_data['id'] = new_id

    #     response = self.client.post('/api/admin/dtd/', raw_data, format='json')

    #     self.assertEqual(response.status_code, 201)
    #     data = json.loads(response.content.decode('utf8'))
    #     self.assertEqual(data['id'], raw_data['id'])
    #     self.assertEqual(data['key'], raw_data['key'])
    #     self.assertEqual(data['description'], raw_data['description'])
    #     self.assertEqual(data['note'], raw_data['note'])
    #     self.assertEqual(data['note_type'], raw_data['note_type'])
    #     self.assertEqual(data['files'], [str(x) for x in raw_data['files']])
    #     self.assertEqual(data['prompt'], raw_data['prompt'])
    #     self.assertEqual(data['link_type'], raw_data['link_type'])
    #     # Fields
    #     self.assertEqual(len(data['fields']), 1)
    #     self.assertEqual(data['fields'], [str(x) for x in raw_data['fields']])
    #     self.assertIsInstance(TreeField.objects.get(id=data['fields'][0]), TreeField)
    #     # Links
    #     self.assertEqual(len(data['links']), 1)
    #     self.assertEqual(data['links'], [str(x) for x in raw_data['links']])
    #     self.assertIsInstance(TreeLink.objects.get(id=data['links'][0]), TreeLink)
