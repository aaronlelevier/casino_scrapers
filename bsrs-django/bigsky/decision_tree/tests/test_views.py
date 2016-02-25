import copy
import json
import uuid

from model_mommy import mommy
from rest_framework.test import APITestCase

from decision_tree.models import TreeField, TreeOption, TreeLink, TreeData
from decision_tree.serializers import (TreeFieldSerializer, TreeOptionSerializer,
    TreeLinkSerializer, TreeDataSerializer,)
from decision_tree.tests.factory import create_tree_link, create_tree_field, create_tree_data
from person.tests.factory import PASSWORD, create_single_person
from ticket.models import TicketStatus


class LoginTestMixin(object):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_single_person()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()


class TreeFieldTests(LoginTestMixin, APITestCase):

    def setUp(self):
        super(TreeFieldTests, self).setUp()
        self.tree_field = create_tree_field()

    def test_detail(self):
        response = self.client.get('/api/admin/dtd-fields/{}/'.format(self.tree_field.id))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.tree_field.id))
        self.assertEqual(data['label'], self.tree_field.label)
        self.assertEqual(data['type'], self.tree_field.type)
        self.assertEqual(len(data['options']), 2)
        for id_ in data['options']:
            self.assertIn(id_, [str(x.id) for x in self.tree_field.options.all()])
        self.assertEqual(data['required'], self.tree_field.required)

    def test_list(self):
        response = self.client.get('/api/admin/dtd-fields/')

        self.assertEqual(response.status_code, 405)

    def test_create(self):
        serializer = TreeFieldSerializer(self.tree_field)
        raw_data = serializer.data
        new_id = str(uuid.uuid4())
        raw_data['id'] = new_id

        response = self.client.post('/api/admin/dtd-fields/', raw_data, format='json')

        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], new_id)
        self.assertEqual(data['label'], raw_data['label'])
        self.assertEqual(data['type'], raw_data['type'])
        self.assertEqual(len(data['options']), 2)
        for id_ in data['options']:
            self.assertIn(id_, [str(x) for x in raw_data['options']])
        self.assertEqual(data['required'], raw_data['required'])

    def test_update(self):
        response = self.client.put('/api/admin/dtd-fields/{}/'.format(self.tree_field.id))

        self.assertEqual(response.status_code, 405)


class TreeOptionTests(LoginTestMixin, APITestCase):

    def setUp(self):
        super(TreeOptionTests, self).setUp()
        self.tree_option = mommy.make(TreeOption)
        serializer = TreeOptionSerializer(self.tree_option)
        self.data = serializer.data

    def test_detail(self):
        response = self.client.get('/api/admin/dtd-options/{}/'.format(self.tree_option.id))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data), 3)
        self.assertEqual(data['id'], str(self.tree_option.id))
        self.assertEqual(data['text'], self.tree_option.text)
        self.assertEqual(data['order'], self.tree_option.order)

    def test_list(self):
        response = self.client.get('/api/admin/dtd-options/')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['text'], self.tree_option.text)
        self.assertEqual(data['results'][0]['order'], self.tree_option.order)

    def test_create(self):
        raw_data = copy.copy(self.data)
        raw_data['id'] = str(uuid.uuid4())

        response = self.client.post('/api/admin/dtd-options/', raw_data, format='json')

        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data), 3)
        self.assertEqual(data['id'], raw_data['id'])
        self.assertEqual(data['text'], raw_data['text'])
        self.assertEqual(data['order'], raw_data['order'])

    def test_update(self):
        new_order = 1
        self.assertNotEqual(self.data['order'], new_order)
        self.data['order'] = new_order

        response = self.client.put('/api/admin/dtd-options/{}/'
            .format(self.tree_option.id), self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['order'], new_order)


class TreeLinkTests(LoginTestMixin, APITestCase):

    def setUp(self):
        super(TreeLinkTests, self).setUp()
        self.tree_link = create_tree_link()

    def test_detail(self):
        response = self.client.get('/api/admin/dtd-links/{}/'
            .format(self.tree_link.id))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.tree_link.id))
        self.assertEqual(data['order'], self.tree_link.order)
        self.assertEqual(data['text'], self.tree_link.text)
        self.assertEqual(data['action_button'], self.tree_link.action_button)
        self.assertEqual(data['is_header'], self.tree_link.is_header)
        self.assertEqual(data['categories'], [str(x.id) for x in self.tree_link.categories.all()])
        self.assertEqual(data['request'], self.tree_link.request)
        self.assertEqual(data['priority'], str(self.tree_link.priority.id))
        self.assertEqual(data['status'], str(self.tree_link.status.id))
        self.assertEqual(data['destination'], str(self.tree_link.destination.id))
        self.assertEqual(data['child_data'][0], str(self.tree_link.child_data.first().id))

    def test_list(self):
        response = self.client.get('/api/admin/dtd-links/')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        data = data['results'][0]
        self.assertEqual(data['id'], str(self.tree_link.id))
        self.assertEqual(data['order'], self.tree_link.order)
        self.assertEqual(data['text'], self.tree_link.text)
        self.assertEqual(data['action_button'], self.tree_link.action_button)
        self.assertEqual(data['is_header'], self.tree_link.is_header)
        self.assertEqual(data['categories'], [str(x.id) for x in self.tree_link.categories.all()])
        self.assertEqual(data['request'], self.tree_link.request)
        self.assertEqual(data['priority'], str(self.tree_link.priority.id))
        self.assertEqual(data['status'], str(self.tree_link.status.id))
        self.assertEqual(data['destination'], str(self.tree_link.destination.id))
        self.assertEqual(data['child_data'][0], str(self.tree_link.child_data.first().id))

    def test_create(self):
        serializer = TreeLinkSerializer(self.tree_link)
        raw_data = copy.copy(serializer.data)
        new_id = str(uuid.uuid4())
        raw_data['id'] = new_id
        destination = mommy.make(TreeData)
        raw_data['destination'] = destination.id

        response = self.client.post('/api/admin/dtd-links/', raw_data, format='json')

        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], new_id)
        self.assertEqual(data['order'], raw_data['order'])
        self.assertEqual(data['text'], raw_data['text'])
        self.assertEqual(data['action_button'], raw_data['action_button'])
        self.assertEqual(data['is_header'], raw_data['is_header'])
        self.assertEqual(data['categories'], [str(x) for x in raw_data['categories']])
        self.assertEqual(data['request'], raw_data['request'])
        self.assertEqual(data['priority'], str(raw_data['priority']))
        self.assertEqual(data['status'], str(raw_data['status']))
        self.assertEqual(data['destination'], str(raw_data['destination']))
        self.assertEqual(data['child_data'], [str(x) for x in raw_data['child_data']])

    def test_update(self):
        response = self.client.put('/api/admin/dtd-links/{}/'.format(self.tree_link.id), {}, format='json')

        self.assertEqual(response.status_code, 405)


class TreeDataTests(LoginTestMixin, APITestCase):

    def setUp(self):
        super(TreeDataTests, self).setUp()
        self.tree_data = create_tree_data()

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
        self.assertEqual(data['fields'], [str(x.id) for x in self.tree_data.fields.all()])
        self.assertIsInstance(TreeField.objects.get(id=data['fields'][0]), TreeField)
        # Links
        self.assertEqual(len(data['links']), 1)
        self.assertEqual(data['links'], [str(x.id) for x in self.tree_data.links.all()])
        self.assertIsInstance(TreeLink.objects.get(id=data['links'][0]), TreeLink)

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

    def test_create(self):
        serializer = TreeDataSerializer(self.tree_data)
        raw_data = copy.copy(serializer.data)
        new_id = str(uuid.uuid4())
        raw_data['id'] = new_id

        response = self.client.post('/api/admin/dtd/', raw_data, format='json')

        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], raw_data['id'])
        self.assertEqual(data['key'], raw_data['key'])
        self.assertEqual(data['description'], raw_data['description'])
        self.assertEqual(data['note'], raw_data['note'])
        self.assertEqual(data['note_type'], raw_data['note_type'])
        self.assertEqual(data['files'], [str(x) for x in raw_data['files']])
        self.assertEqual(data['prompt'], raw_data['prompt'])
        self.assertEqual(data['link_type'], raw_data['link_type'])
        # Fields
        self.assertEqual(len(data['fields']), 1)
        self.assertEqual(data['fields'], [str(x) for x in raw_data['fields']])
        self.assertIsInstance(TreeField.objects.get(id=data['fields'][0]), TreeField)
        # Links
        self.assertEqual(len(data['links']), 1)
        self.assertEqual(data['links'], [str(x) for x in raw_data['links']])
        self.assertIsInstance(TreeLink.objects.get(id=data['links'][0]), TreeLink)

    def test_update(self):
        response = self.client.put('/api/admin/dtd/{}/'.format(self.tree_data.id), {}, format='json')

        self.assertEqual(response.status_code, 405)
