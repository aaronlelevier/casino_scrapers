import copy
import json
import uuid

from model_mommy import mommy
from rest_framework.test import APITestCase

from dtd.model_choices import FIELD_TYPES
from dtd.models import TreeField
from dtd.serializers import TreeDataCreateUpdateSerializer
from dtd.tests.mixins import TreeDataTestSetUpMixin
from utils.create import random_lorem, _generate_chars


class UniqueDtdFieldValidatorTests(TreeDataTestSetUpMixin, APITestCase):

    def test_post__raise_error_for_non_unique_label(self):
        label = 'foo'
        non_unique = set([label])
        serializer = TreeDataCreateUpdateSerializer(self.tree_data)
        raw_data = copy.copy(serializer.data)
        new_id = str(uuid.uuid4())
        raw_data.update({
            'id': str(uuid.uuid4()),
            'key': _generate_chars(),
            'fields': [{
                'id': str(uuid.uuid4()),
                'label': label,
            },{
                'id': str(uuid.uuid4()),
                'label': label,
            }],
            'attachments': []
        })

        response = self.client.post('/api/dtds/', raw_data, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            json.loads(response.content.decode('utf8'))['non_field_errors'][0],
            "Labels '{}' already exists for the Decision Tree node.".format(', '.join(non_unique))
        )

    def test_post__no_error_if_label_on_other_dtd(self):
        label = 'foo'
        mommy.make(TreeField, label=label)
        serializer = TreeDataCreateUpdateSerializer(self.tree_data)
        raw_data = copy.copy(serializer.data)
        new_id = str(uuid.uuid4())
        raw_data.update({
            'id': str(uuid.uuid4()),
            'key': _generate_chars(),
            'fields': [{
                'id': str(uuid.uuid4()),
                'label': label,
            }],
            'attachments': []
        })

        response = self.client.post('/api/dtds/', raw_data, format='json')

        self.assertEqual(response.status_code, 201)

    def test_post__no_error_if_no_fields_because_nothing_to_check(self):
        label = 'foo'
        mommy.make(TreeField, label=label)
        serializer = TreeDataCreateUpdateSerializer(self.tree_data)
        raw_data = copy.copy(serializer.data)
        new_id = str(uuid.uuid4())
        raw_data.update({
            'id': str(uuid.uuid4()),
            'key': _generate_chars(),
            'fields': [],
            'attachments': []
        })

        response = self.client.post('/api/dtds/', raw_data, format='json')

        self.assertEqual(response.status_code, 201)

    def test_put(self):
        serializer = TreeDataCreateUpdateSerializer(self.tree_data)
        raw_data = copy.copy(serializer.data)
        label = raw_data['fields'][0]['label']
        non_unique = set([label])
        new_id = str(uuid.uuid4())
        raw_data['fields'].append({
            'id': str(uuid.uuid4()),
            'label': label,
        })
        raw_data['attachments'] = []

        response = self.client.put('/api/dtds/{}/'.format(self.tree_data.id), raw_data, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            json.loads(response.content.decode('utf8'))['non_field_errors'][0],
            "Labels '{}' already exists for the Decision Tree node.".format(', '.join(non_unique))
        )
