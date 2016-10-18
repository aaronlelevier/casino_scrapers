import copy
import json
import uuid

from model_mommy import mommy
from rest_framework.test import APITestCase

from category.tests.factory import create_single_category
from dtd.models import TreeOption, TreeData, TreeField
from dtd.serializers import TreeDataCreateUpdateSerializer
from dtd.tests.mixins import TreeDataTestSetUpMixin
from generic.tests.factory import create_file_attachment
from ticket.tests.factory_related import create_ticket_status, create_ticket_priority
from utils.create import random_lorem, _generate_chars
from utils.helpers import media_path


class TreeDataDetailTests(TreeDataTestSetUpMixin, APITestCase):

    def test_detail(self):
        link = self.tree_data.links.first()
        link.destination = mommy.make(TreeData)
        link.save() 
        
        response = self.client.get('/api/dtds/{}/'.format(self.tree_data.id))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.tree_data.id))
        self.assertEqual(data['key'], self.tree_data.key)
        self.assertEqual(data['description'], self.tree_data.description)
        self.assertEqual(data['note'], self.tree_data.note)
        self.assertEqual(data['note_type'], self.tree_data.note_type)
        self.assertEqual(data['attachments'][0]['id'], str(self.attachment.id))
        self.assertEqual(data['attachments'][0]['filename'], self.attachment.filename)
        self.assertEqual(data['attachments'][0]['file'], media_path(str(self.attachment.file)))
        self.assertEqual(data['attachments'][0]['filename'], self.attachment.filename)
        self.assertEqual(data['attachments'][0]['image_medium'], media_path(str(self.attachment.image_medium)))
        self.assertEqual(data['attachments'][0]['image_thumbnail'], media_path(str(self.attachment.image_thumbnail)))
        self.assertEqual(data['attachments'][0]['image_full'], media_path(str(self.attachment.image_full)))
        self.assertEqual(data['prompt'], self.tree_data.prompt)
        self.assertEqual(data['link_type'], self.tree_data.link_type)
        # Fields - 5 fields for dtd
        self.assertEqual(len(data['fields']), 5)
        field = self.tree_data.fields.first()
        self.assertTrue(data['fields'][0]['id'])
        self.assertTrue(data['fields'][0]['label'])
        self.assertTrue(data['fields'][0]['type'])
        self.assertTrue(data['fields'][0]['required'])
        self.assertIn(str(field.id), [str(field['id']) for field in data['fields']])
        self.assertIn(field.order, [field['order'] for field in data['fields']])
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
        self.assertEqual(data['links'][0]['categories'][0]['id'], str(link.categories.first().id))
        self.assertEqual(data['links'][0]['categories'][0]['name'], link.categories.first().name)
        self.assertEqual(data['links'][0]['request'], link.request)
        self.assertEqual(data['links'][0]['priority_fk'], str(link.priority.id))
        self.assertEqual(data['links'][0]['status_fk'], str(link.status.id))
        self.assertEqual(data['links'][0]['dtd_fk'], str(self.tree_data.id))
        self.assertEqual(data['links'][0]['destination']['id'], str(link.destination.id))
        self.assertEqual(data['links'][0]['destination']['key'], link.destination.key)
        self.assertEqual(data['links'][0]['destination']['description'], link.destination.description)


class TreeDataListTests(TreeDataTestSetUpMixin, APITestCase):

    def test_list(self):
        response = self.client.get('/api/dtds/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        for d in data['results']:
            if d['id'] == str(self.tree_data.id):
                data = d
        self.assertEqual(data['id'], str(self.tree_data.id))
        self.assertEqual(data['key'], self.tree_data.key)
        self.assertEqual(data['description'], self.tree_data.description)

    def test_list_key_lookup(self):
        dtd = mommy.make(TreeData, key='1.11')
        response = self.client.get('/api/dtds/?key__icontains={}'.format(dtd.key))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)

    def test_list_description_lookup(self):
        dtd = mommy.make(TreeData, description='999')
        response = self.client.get('/api/dtds/?description__icontains={}'.format(dtd.description))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)

    def test_list_search_key(self):
        dtd = mommy.make(TreeData, key='999')
        response = self.client.get('/api/dtds/?search={}'.format(dtd.key))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)

    def test_list_search_description(self):
        dtd = mommy.make(TreeData, description='999')
        response = self.client.get('/api/dtds/?search={}'.format(dtd.description))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)


class TreeDataCreateTests(TreeDataTestSetUpMixin, APITestCase):

    def test_create__not_related_fields_only(self):
        serializer = TreeDataCreateUpdateSerializer(self.tree_data)
        raw_data = copy.copy(serializer.data)
        new_id = str(uuid.uuid4())
        raw_data['id'] = new_id
        raw_data['key'] = _generate_chars()
        raw_data['attachments'] = [obj['id'] for obj in raw_data['attachments']]

        response = self.client.post('/api/dtds/', raw_data, format='json')

        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], raw_data['id'])
        self.assertEqual(data['key'], raw_data['key'])
        self.assertEqual(data['description'], raw_data['description'])
        self.assertEqual(data['note'], raw_data['note'])
        self.assertEqual(data['note_type'], raw_data['note_type'])
        self.assertEqual(data['attachments'][0]['id'], str(self.attachment.id))
        self.assertEqual(data['attachments'][0]['filename'], self.attachment.filename)
        self.assertEqual(data['attachments'][0]['file'], media_path(str(self.attachment.file)))
        self.assertEqual(data['attachments'][0]['image_full'], media_path(str(self.attachment.image_full)))
        self.assertEqual(data['attachments'][0]['image_medium'], media_path(str(self.attachment.image_medium)))
        self.assertEqual(data['attachments'][0]['image_thumbnail'], media_path(str(self.attachment.image_thumbnail)))
        self.assertEqual(data['prompt'], raw_data['prompt'])
        self.assertEqual(data['link_type'], raw_data['link_type'])

    def test_create__and_attachment(self):
        serializer = TreeDataCreateUpdateSerializer(self.tree_data)
        raw_data = copy.copy(serializer.data)
        new_id = str(uuid.uuid4())
        new_attachment = create_file_attachment()
        raw_data['id'] = new_id
        raw_data['key'] = _generate_chars()
        raw_data['attachments'] = [obj['id'] for obj in raw_data['attachments']]
        raw_data['attachments'].append(str(new_attachment.id))
        self.assertEqual(self.tree_data.attachments.count(), 1)

        response = self.client.post('/api/dtds/', raw_data, format='json')

        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['attachments']), 2)
        self.assertIn(str(new_attachment.id), data['attachments'][1]['id'])

    def test_create__and_create_field(self):
        serializer = TreeDataCreateUpdateSerializer(self.tree_data)
        raw_data = copy.copy(serializer.data)
        new_id = str(uuid.uuid4())
        raw_data['id'] = new_id
        raw_data['key'] = _generate_chars()
        raw_data['fields'] = [{
            'id': str(uuid.uuid4()),
            'label': random_lorem(),
            'type': TreeField.TEXT,
            # 'options': [], # purposely left out b/c not a required field
            'required': True
        }]
        raw_data['attachments'] = [obj['id'] for obj in raw_data['attachments']]

        response = self.client.post('/api/dtds/', raw_data, format='json')

        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['fields']), 1)
        self.assertEqual(data['fields'][0]['id'], raw_data['fields'][0]['id'])
        self.assertEqual(data['fields'][0]['label'], raw_data['fields'][0]['label'])
        self.assertEqual(data['fields'][0]['type'], raw_data['fields'][0]['type'])
        self.assertEqual(data['fields'][0]['options'], [])
        self.assertEqual(data['fields'][0]['required'], raw_data['fields'][0]['required'])

    def test_create__and_create_field_and_option(self):
        serializer = TreeDataCreateUpdateSerializer(self.tree_data)
        raw_data = copy.copy(serializer.data)
        new_id = str(uuid.uuid4())
        raw_data['id'] = new_id
        raw_data['key'] = _generate_chars()
        raw_data['attachments'] = [obj['id'] for obj in raw_data['attachments']]
        raw_data['fields'] = [{
            'id': str(uuid.uuid4()),
            'label': random_lorem(),
            'type': TreeField.TEXT,
            'required': True,
            'order': 1,
            'options': [{
                'id': str(uuid.uuid4()),
                'text': random_lorem(),
                'order': 1
            }]
        }]

        response = self.client.post('/api/dtds/', raw_data, format='json')

        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content.decode('utf8'))
        # Field
        self.assertEqual(len(data['fields']), 1)
        self.assertEqual(data['fields'][0]['id'], raw_data['fields'][0]['id'])
        self.assertEqual(data['fields'][0]['label'], raw_data['fields'][0]['label'])
        self.assertEqual(data['fields'][0]['type'], raw_data['fields'][0]['type'])
        self.assertEqual(data['fields'][0]['required'], raw_data['fields'][0]['required'])
        self.assertEqual(data['fields'][0]['order'], raw_data['fields'][0]['order'])
        # Option
        self.assertEqual(len(data['fields'][0]['options']), 1)
        self.assertEqual(data['fields'][0]['options'][0]['id'], raw_data['fields'][0]['options'][0]['id'])
        self.assertEqual(data['fields'][0]['options'][0]['order'], raw_data['fields'][0]['options'][0]['order'])
        self.assertEqual(data['fields'][0]['options'][0]['text'], raw_data['fields'][0]['options'][0]['text'])

    def test_create__and_create_link(self):
        serializer = TreeDataCreateUpdateSerializer(self.tree_data)
        raw_data = copy.copy(serializer.data)
        new_id = str(uuid.uuid4())
        category = create_single_category()
        priority = create_ticket_priority()
        status = create_ticket_status()
        dtd = mommy.make(TreeData)
        destination = mommy.make(TreeData)
        raw_data['id'] = new_id
        raw_data['key'] = _generate_chars()
        raw_data['attachments'] = [obj['id'] for obj in raw_data['attachments']]
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
            # 'dtd':  # purposely left blank, will be the DTD being created here
            'destination': str(destination.id)
        }]

        response = self.client.post('/api/dtds/', raw_data, format='json')

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
        self.assertEqual(data['links'][0]['dtd'], new_id)
        self.assertEqual(data['links'][0]['destination'], str(destination.id))


class TreeDataUpdateTests(TreeDataTestSetUpMixin, APITestCase):

    def setUp(self):
        super(TreeDataUpdateTests, self).setUp()
        serializer = TreeDataCreateUpdateSerializer(self.tree_data)
        self.data = copy.copy(serializer.data)

    def test_change_first_level_fields(self):
        key = random_lorem()
        description = random_lorem()
        note = random_lorem()
        note_type = TreeData.NOTE_TYPE_INFO
        prompt = random_lorem()
        link_type = TreeData.LINK_TYPE_LINKS
        self.data['key'] = key
        self.data['description'] = description
        self.data['note'] = note
        self.data['note_type'] = note_type
        self.data['prompt'] = prompt
        self.data['link_type'] = link_type
        self.data['attachments'] = [obj['id'] for obj in self.data['attachments']]

        response = self.client.put('/api/dtds/{}/'.format(self.tree_data.id), self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['key'], key)
        self.assertEqual(data['description'], description)
        self.assertEqual(data['note'], note)
        self.assertEqual(data['note_type'], note_type)
        self.assertEqual(data['prompt'], prompt)
        self.assertEqual(data['link_type'], link_type)

    def test_add_attachment(self):
        attachment = create_file_attachment()
        self.data['attachments'] = [obj['id'] for obj in self.data['attachments']]
        self.data['attachments'].append(str(attachment.id))

        response = self.client.put('/api/dtds/{}/'.format(self.tree_data.id), self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['attachments']), 2)
        self.assertIn(str(attachment.id), [a['id'] for a in data['attachments']])

    def test_remove_attachment(self):
        attachment = create_file_attachment()
        attachment_two = create_file_attachment()
        self.tree_data.attachments.add(attachment)
        self.tree_data.attachments.add(attachment_two)
        self.assertEqual(self.tree_data.attachments.count(), 3)
        self.data['attachments'] = [str(attachment.id)]

        response = self.client.put('/api/dtds/{}/'.format(self.tree_data.id), self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['attachments']), 1)
        self.assertEqual(data['attachments'][0]['id'], str(attachment.id))

    def test_add_field_no_options(self):
        self.data['attachments'] = [obj['id'] for obj in self.data['attachments']]
        self.data['fields'] = [{
            'id': str(uuid.uuid4()),
            'label': random_lorem(),
            'type': TreeField.TEXT,
            'required': True,
            'order': 2,
            # 'options': [], # purposely left out b/c not a required field
        }]

        response = self.client.put('/api/dtds/{}/'.format(self.tree_data.id), self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['fields']), 1)
        self.assertEqual(data['fields'][0]['id'], self.data['fields'][0]['id'])
        self.assertEqual(data['fields'][0]['label'], self.data['fields'][0]['label'])
        self.assertEqual(data['fields'][0]['type'], self.data['fields'][0]['type'])
        self.assertEqual(data['fields'][0]['required'], self.data['fields'][0]['required'])
        self.assertEqual(data['fields'][0]['order'], self.data['fields'][0]['order'])
        self.assertEqual(data['fields'][0]['options'], [])

    def test_add_field_and_options(self):
        self.data['attachments'] = [obj['id'] for obj in self.data['attachments']]
        self.data['fields'] = [{
            'id': str(uuid.uuid4()),
            'label': random_lorem(),
            'type': TreeField.TEXT,
            'required': True,
            'order': 1,
            'options': [{
                'id': str(uuid.uuid4()),
                'text': random_lorem(),
                'order': 1
            }]
        }]

        response = self.client.put('/api/dtds/{}/'.format(self.tree_data.id), self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        # Field
        self.assertEqual(len(data['fields']), 1)
        self.assertEqual(data['fields'][0]['id'], self.data['fields'][0]['id'])
        self.assertEqual(data['fields'][0]['label'], self.data['fields'][0]['label'])
        self.assertEqual(data['fields'][0]['type'], self.data['fields'][0]['type'])
        self.assertEqual(data['fields'][0]['required'], self.data['fields'][0]['required'])
        self.assertEqual(data['fields'][0]['order'], self.data['fields'][0]['order'])
        # Option
        self.assertEqual(len(data['fields'][0]['options']), 1)
        self.assertEqual(data['fields'][0]['options'][0]['id'], self.data['fields'][0]['options'][0]['id'])
        self.assertEqual(data['fields'][0]['options'][0]['order'], self.data['fields'][0]['options'][0]['order'])
        self.assertEqual(data['fields'][0]['options'][0]['text'], self.data['fields'][0]['options'][0]['text'])
    
    def test_update_existing_field(self):
        self.data['fields'][0]['label'] = random_lorem()
        self.data['attachments'] = [obj['id'] for obj in self.data['attachments']]

        response = self.client.put('/api/dtds/{}/'.format(self.tree_data.id), self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertTrue(data['fields'][0]['label'])
        
    def test_remove_fields(self):
        self.data['fields'] = []
        self.data['attachments'] = [obj['id'] for obj in self.data['attachments']]

        response = self.client.put('/api/dtds/{}/'.format(self.tree_data.id), self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['fields']), 0)

    def test_add_option(self):
        self.data['attachments'] = [obj['id'] for obj in self.data['attachments']]
        self.data['fields'][0]['options'] = [{
            'id': str(uuid.uuid4()),
            'text': random_lorem(),
            'order': 1
        }]
        self.assertEqual(len(self.data['fields'][0]['options']), 1)

        response = self.client.put('/api/dtds/{}/'.format(self.tree_data.id), self.data, format='json')
        data = json.loads(response.content.decode('utf8'))

        for f in data['fields']:
            if f['id'] == self.data['fields'][0]['id']:
                post_field = f

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(post_field['options']), 1)
        self.assertEqual(post_field['options'][0]['id'], self.data['fields'][0]['options'][0]['id'])
        self.assertEqual(post_field['options'][0]['order'], self.data['fields'][0]['options'][0]['order'])
        self.assertEqual(post_field['options'][0]['text'], self.data['fields'][0]['options'][0]['text'])

    def test_remove_option(self):
        self.assertEqual(len(self.data['fields'][0]['options']), 2)
        self.data['attachments'] = [obj['id'] for obj in self.data['attachments']]
        self.data['fields'][0]['options'] = []

        response = self.client.put('/api/dtds/{}/'.format(self.tree_data.id), self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['fields'][0]['options']), 0)

    def test_update_existing_option(self):
        self.data['fields'][0]['options'][0].update({
            'text': random_lorem(),
            'order': 3
        })
        self.data['attachments'] = []

        response = self.client.put('/api/dtds/{}/'.format(self.tree_data.id), self.data, format='json')
        data = json.loads(response.content.decode('utf8'))

        for f in data['fields']:
            for op in f['options']:
                if op['id'] == self.data['fields'][0]['options'][0]['id']:
                    post_option = op

        self.assertEqual(response.status_code, 200)
        self.assertEqual(post_option['text'], self.data['fields'][0]['options'][0]['text'])
        self.assertEqual(post_option['order'], self.data['fields'][0]['options'][0]['order'])

    def test_add_link(self):
        category = create_single_category()
        priority = create_ticket_priority()
        status = create_ticket_status()
        dtd = mommy.make(TreeData)
        destination = mommy.make(TreeData)
        self.data['links'] = [{
            'id': str(uuid.uuid4()),
            'order': 1,
            'text': random_lorem(),
            'action_button': True,
            'is_header': True,
            'categories': [str(category.id)],
            'request': random_lorem(),
            'priority': str(priority.id),
            'status': str(status.id),
            # 'dtd':  # purposely left blank, will be the DTD being created here
            'destination': str(destination.id)
        }]
        self.data['attachments'] = [obj['id'] for obj in self.data['attachments']]

        response = self.client.put('/api/dtds/{}/'.format(self.tree_data.id), self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['links']), 1)
        self.assertEqual(data['links'][0]['id'], self.data['links'][0]['id'])
        self.assertEqual(data['links'][0]['order'], self.data['links'][0]['order'])
        self.assertEqual(data['links'][0]['text'], self.data['links'][0]['text'])
        self.assertEqual(data['links'][0]['action_button'], self.data['links'][0]['action_button'])
        self.assertEqual(data['links'][0]['is_header'], self.data['links'][0]['is_header'])
        self.assertEqual(len(data['links'][0]['categories']), 1)
        self.assertEqual(data['links'][0]['categories'][0], str(category.id))
        self.assertEqual(data['links'][0]['request'], self.data['links'][0]['request'])
        self.assertEqual(data['links'][0]['priority'], str(priority.id))
        self.assertEqual(data['links'][0]['status'], str(status.id))
        self.assertEqual(data['links'][0]['dtd'], str(self.tree_data.id))
        self.assertEqual(data['links'][0]['destination'], str(destination.id))

    def test_update_existing_link__first_level_key(self):
        self.assertEqual(len(self.data['links']), 1)
        self.data['links'][0]['text'] = random_lorem()
        self.data['attachments'] = [obj['id'] for obj in self.data['attachments']]

        response = self.client.put('/api/dtds/{}/'.format(self.tree_data.id), self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['links']), 1)
        self.assertEqual(data['links'][0]['text'], self.data['links'][0]['text'])

    def test_update_existing_link__categories(self):
        self.assertEqual(len(self.data['links']), 1)
        category = create_single_category()
        self.assertEqual(len( self.data['links'][0]['categories']), 1)
        self.data['links'][0]['categories'] = [str(category.id)]
        self.data['attachments'] = [obj['id'] for obj in self.data['attachments']]

        response = self.client.put('/api/dtds/{}/'.format(self.tree_data.id), self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['links']), 1)
        self.assertEqual(data['links'][0]['categories'], self.data['links'][0]['categories'])

    def test_update_existing_link__foreign_keys(self):
        priority = create_ticket_priority()
        status = create_ticket_status()
        dtd = mommy.make(TreeData)
        destination = mommy.make(TreeData)
        self.assertEqual(len(self.data['links']), 1)
        self.data['links'][0].update({
            'request': random_lorem(),
            'priority': str(priority.id),
            'status': str(status.id),
            'destination': str(destination.id)
        })
        self.data['attachments'] = [obj['id'] for obj in self.data['attachments']]

        response = self.client.put('/api/dtds/{}/'.format(self.tree_data.id), self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['links'][0]['priority'], str(priority.id))
        self.assertEqual(data['links'][0]['status'], str(status.id))
        self.assertEqual(data['links'][0]['dtd'], str(self.tree_data.id))
        self.assertEqual(data['links'][0]['destination'], str(destination.id))

    def test_remove_link(self):
        self.data['links'] = []
        self.data['attachments'] = [obj['id'] for obj in self.data['attachments']]

        response = self.client.put('/api/dtds/{}/'.format(self.tree_data.id), self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['links']), 0)
