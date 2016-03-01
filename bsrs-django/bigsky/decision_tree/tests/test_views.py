import copy
import json
import uuid

from model_mommy import mommy
from rest_framework.test import APITestCase

from category.tests.factory import create_single_category
from decision_tree.models import TreeField, TreeOption, TreeLink, TreeData
from decision_tree.serializers import TreeDataSerializer
from decision_tree.tests.factory import create_tree_link, create_tree_field, create_tree_data
from generic.models import Attachment
from generic.tests.factory import create_attachments
from person.tests.factory import PASSWORD, create_single_person
from ticket.tests.factory import create_ticket_status, create_ticket_priority
from utils.create import random_lorem


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
        link = self.tree_data.links.first()
        link.destination = mommy.make(TreeData)
        link.save() 
        
        response = self.client.get('/api/admin/dtd/{}/'.format(self.tree_data.id))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.tree_data.id))
        self.assertEqual(data['key'], self.tree_data.key)
        self.assertEqual(data['description'], self.tree_data.description)
        self.assertEqual(data['note'], self.tree_data.note)
        self.assertEqual(data['note_type'], self.tree_data.note_type)
        self.assertEqual(data['attachments'], [str(x.id) for x in self.tree_data.attachments.all()])
        self.assertEqual(data['prompt'], self.tree_data.prompt)
        self.assertEqual(data['link_type'], self.tree_data.link_type)
        # Fields
        self.assertEqual(len(data['fields']), 1)
        field = self.tree_data.fields.first()
        self.assertEqual(data['fields'][0]['id'], str(field.id))
        self.assertEqual(data['fields'][0]['label'], field.label)
        self.assertEqual(data['fields'][0]['required'], field.required)
        # Options
        self.assertEqual(len(data['fields'][0]['options']), 2)
        option = TreeOption.objects.get(id=data['fields'][0]['options'][0]['id'])
        self.assertEqual(data['fields'][0]['options'][0]['text'], option.text)
        self.assertEqual(data['fields'][0]['options'][0]['order'], option.order)
        # Links
        self.assertEqual(len(data['links']), 1)
        link = self.tree_data.links.first()
        self.assertEqual(data['links'][0]['id'], str(link.id))
        self.assertEqual(data['links'][0]['order'], link.order)
        self.assertEqual(data['links'][0]['text'], link.text)
        self.assertEqual(data['links'][0]['action_button'], link.action_button)
        self.assertEqual(data['links'][0]['is_header'], link.is_header)
        self.assertEqual(len(data['links'][0]['categories']), 1)
        self.assertEqual(data['links'][0]['request'], link.request)
        self.assertEqual(data['links'][0]['priority'], str(link.priority.id))
        self.assertEqual(data['links'][0]['status'], str(link.status.id))
        self.assertEqual(data['links'][0]['parent'], str(self.tree_data.id))
        self.assertEqual(data['links'][0]['destination'], str(link.destination.id))

    def test_list(self):
        response = self.client.get('/api/admin/dtd/')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        for d in data['results']:
            if d['id'] == str(self.tree_data.id):
                data = d
        self.assertEqual(data['id'], str(self.tree_data.id))
        self.assertEqual(data['key'], self.tree_data.key)
        self.assertEqual(data['description'], self.tree_data.description)
        # Links
        link = self.tree_data.links.first()
        self.assertEqual(len(data['links']), 1)
        self.assertEqual(data['links'][0]['id'], str(link.id))
        self.assertEqual(data['links'][0]['order'], link.order)
        self.assertEqual(data['links'][0]['text'], link.text)

    # # create

    def test_create__not_related_fields_only(self):
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
        self.assertEqual(data['attachments'], [])
        self.assertEqual(data['prompt'], raw_data['prompt'])
        self.assertEqual(data['link_type'], raw_data['link_type'])

    def test_create__and_attachment(self):
        serializer = TreeDataSerializer(self.tree_data)
        raw_data = copy.copy(serializer.data)
        new_id = str(uuid.uuid4())
        new_attachment = create_attachments()
        raw_data['id'] = new_id
        raw_data['attachments'].append(str(new_attachment.id))
        self.assertEqual(self.tree_data.attachments.count(), 0)

        response = self.client.post('/api/admin/dtd/', raw_data, format='json')

        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['attachments']), 1)
        self.assertIn(str(new_attachment.id), data['attachments'])

    def test_create__and_create_field(self):
        serializer = TreeDataSerializer(self.tree_data)
        raw_data = copy.copy(serializer.data)
        new_id = str(uuid.uuid4())
        raw_data['id'] = new_id
        raw_data['fields'] = [{
            'id': str(uuid.uuid4()),
            'label': random_lorem(),
            'type': random_lorem(),
            # 'options': [], # purposely left out b/c not a required field
            'required': True
        }]

        response = self.client.post('/api/admin/dtd/', raw_data, format='json')

        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['fields']), 1)
        self.assertEqual(data['fields'][0]['id'], raw_data['fields'][0]['id'])
        self.assertEqual(data['fields'][0]['label'], raw_data['fields'][0]['label'])
        self.assertEqual(data['fields'][0]['type'], raw_data['fields'][0]['type'])
        self.assertEqual(data['fields'][0]['options'], [])
        self.assertEqual(data['fields'][0]['required'], raw_data['fields'][0]['required'])

    def test_create__and_create_field_and_option(self):
        serializer = TreeDataSerializer(self.tree_data)
        raw_data = copy.copy(serializer.data)
        new_id = str(uuid.uuid4())
        raw_data['id'] = new_id
        raw_data['fields'] = [{
            'id': str(uuid.uuid4()),
            'label': random_lorem(),
            'type': random_lorem(),
            'options': [{
                'id': str(uuid.uuid4()),
                'text': random_lorem(),
                'order': 1
            }],
            'required': True
        }]

        response = self.client.post('/api/admin/dtd/', raw_data, format='json')

        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content.decode('utf8'))
        # Field
        self.assertEqual(len(data['fields']), 1)
        self.assertEqual(data['fields'][0]['id'], raw_data['fields'][0]['id'])
        self.assertEqual(data['fields'][0]['label'], raw_data['fields'][0]['label'])
        self.assertEqual(data['fields'][0]['type'], raw_data['fields'][0]['type'])
        self.assertEqual(data['fields'][0]['required'], raw_data['fields'][0]['required'])
        # Option
        self.assertEqual(len(data['fields'][0]['options']), 1)
        self.assertEqual(data['fields'][0]['options'][0]['id'], raw_data['fields'][0]['options'][0]['id'])
        self.assertEqual(data['fields'][0]['options'][0]['order'], raw_data['fields'][0]['options'][0]['order'])
        self.assertEqual(data['fields'][0]['options'][0]['text'], raw_data['fields'][0]['options'][0]['text'])

    def test_create__and_create_link(self):
        serializer = TreeDataSerializer(self.tree_data)
        raw_data = copy.copy(serializer.data)
        new_id = str(uuid.uuid4())
        category = create_single_category()
        priority = create_ticket_priority()
        status = create_ticket_status()
        parent = mommy.make(TreeData)
        destination = mommy.make(TreeData)
        raw_data['id'] = new_id
        raw_data['links'] = [{
            'id': str(uuid.uuid4()),
            'order': 1,
            'text': random_lorem(),
            'action_button': True,
            'is_header': True,
            'categories': [str(category.id)],
            'request': random_lorem(),
            'priority': str(priority.id),
            'status': str(status.id),
            # 'parent':  # purposely left blank, will be the DTD being created here
            'destination': str(destination.id)
        }]

        response = self.client.post('/api/admin/dtd/', raw_data, format='json')

        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content.decode('utf8'))
        # Field
        self.assertEqual(len(data['links']), 1)
        self.assertEqual(data['links'][0]['id'], raw_data['links'][0]['id'])
        self.assertEqual(data['links'][0]['order'], raw_data['links'][0]['order'])
        self.assertEqual(data['links'][0]['text'], raw_data['links'][0]['text'])
        self.assertEqual(data['links'][0]['action_button'], raw_data['links'][0]['action_button'])
        self.assertEqual(data['links'][0]['is_header'], raw_data['links'][0]['is_header'])
        self.assertEqual(len(data['links'][0]['categories']), 1)
        self.assertEqual(data['links'][0]['categories'][0], str(category.id))
        self.assertEqual(data['links'][0]['request'], raw_data['links'][0]['request'])
        self.assertEqual(data['links'][0]['priority'], str(priority.id))
        self.assertEqual(data['links'][0]['status'], str(status.id))
        self.assertEqual(data['links'][0]['parent'], new_id)
        self.assertEqual(data['links'][0]['destination'], str(destination.id))
