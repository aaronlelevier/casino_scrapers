import copy
import json
import uuid

from model_mommy import mommy
from rest_framework.test import APITestCase

from decision_tree.models import TreeOption, TreeLink, TreeData
from decision_tree.serializers import TreeOptionSerializer, TreeLinkSerializer
from decision_tree.tests.factory import create_tree_link
from person.tests.factory import PASSWORD, create_single_person
from ticket.models import TicketStatus


class LoginTestMixin(object):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_single_person()
        self.client.login(username=self.person.username, password=PASSWORD)


class TreeOptionTests(LoginTestMixin, APITestCase):

    def setUp(self):
        super(TreeOptionTests, self).setUp()
        self.tree_option = mommy.make(TreeOption)
        serializer = TreeOptionSerializer(self.tree_option)
        self.data = serializer.data

    def tearDown(self):
        self.client.logout()

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
        self.assertEqual(data['tree_data_parent'], str(self.tree_link.tree_data_parent.id))
        self.assertEqual(data['tree_data_links'][0], str(self.tree_link.tree_data_links.first().id))

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
        self.assertEqual(data['tree_data_parent'], str(self.tree_link.tree_data_parent.id))
        self.assertEqual(data['tree_data_links'][0], str(self.tree_link.tree_data_links.first().id))

    def test_create(self):
        serializer = TreeLinkSerializer(self.tree_link)
        raw_data = serializer.data
        raw_data['id'] = str(uuid.uuid4())

        response = self.client.post('/api/admin/dtd-links/', raw_data, format='json')

        self.assertEqual(response.status_code, 201)

    def test_update(self):
        response = self.client.put('/api/admin/dtd-links/{}/'.format(self.tree_link.id), {}, format='json')

        self.assertEqual(response.status_code, 405)


class TreeDataTests(LoginTestMixin, APITestCase):

    def setUp(self):
        super(TreeDataTests, self).setUp()
        self.tree_data = mommy.make(TreeData)

    def test_list(self):
        response = self.client.get('/api/admin/dtd/')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        data = data['results'][0]
        self.assertEqual(data['id'], str(self.tree_data.id))
        self.assertEqual(data['key'], self.tree_data.key)
        self.assertEqual(data['description'], self.tree_data.description)




