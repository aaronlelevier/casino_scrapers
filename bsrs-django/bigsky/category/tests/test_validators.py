import json
import uuid

from rest_framework.test import APITestCase

from category.serializers import CategoryUpdateSerializer
from category.tests.factory import create_single_category
from person.tests.factory import PASSWORD, create_single_person


class CategoryParentAndNameValidatorTests(APITestCase):

    def setUp(self):
        self.person = create_single_person()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_unique_top_level(self):
        name = 'foo'
        category_one = create_single_category(name=name)
        serializer = CategoryUpdateSerializer(category_one)
        data_two = serializer.data
        data_two.update({
            'id': str(uuid.uuid4()),
            'name': name
        })

        response = self.client.post('/api/admin/categories/', data_two, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            json.loads(response.content.decode('utf8'))['non_field_errors'][0],
            "Category with name: {name} and parent: {parent} already exists.".format(name=name, parent=None)
        )

    def test_unique_non_top_level(self):
        name = 'foo'
        parent = create_single_category()
        category_one = create_single_category(name=name, parent=parent)
        serializer = CategoryUpdateSerializer(category_one)
        data_two = serializer.data
        data_two.update({
            'id': str(uuid.uuid4()),
            'name': name,
            'parent': str(parent.id)
        })

        response = self.client.post('/api/admin/categories/', data_two, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            json.loads(response.content.decode('utf8'))['non_field_errors'][0],
            "Category with name: {name} and parent: {parent} already exists.".format(name=name, parent=parent)
        )

    def test_unique_rules_not_enforced_against_deleted_records(self):
        name = 'foo'
        category_one = create_single_category(name=name)
        category_one.delete()
        serializer = CategoryUpdateSerializer(category_one)
        data_two = serializer.data
        data_two.update({
            'id': str(uuid.uuid4()),
            'name': name
        })

        response = self.client.post('/api/admin/categories/', data_two, format='json')

        self.assertEqual(response.status_code, 201)

    def test_unique_does_not_check_against_own_record_on_a_put(self):
        name = 'foo'
        category_one = create_single_category(name=name)
        serializer = CategoryUpdateSerializer(category_one)
        data = serializer.data

        response = self.client.put('/api/admin/categories/{}/'.format(category_one.id), data, format='json')

        self.assertEqual(response.status_code, 200)
