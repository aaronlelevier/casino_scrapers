import json
import uuid

from model_mommy import mommy
from rest_framework.test import APITestCase

from category import serializers
from category.models import Category
from category.serializers import CategorySerializer
from category.tests.factory import  create_categories
from person.tests.factory import PASSWORD, create_person
from util import create


### CATEGORY

class CategoryListTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        # Category
        create_categories()
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_response(self):
        response = self.client.get('/api/admin/categories/')
        self.assertEqual(response.status_code, 200)

    def test_data(self):
        response = self.client.get('/api/admin/categories/')
        data = json.loads(response.content)
        self.assertTrue(len(data['results']) > 0)


class CategoryDetailTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        # Category
        create_categories()
        self.type = Category.objects.get(name='repair')
        self.trade = Category.objects.get(name='electric')
        self.issue = Category.objects.get(name='outlets')
        self.issue2 = Category.objects.get(name='fans')
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_response(self):
        response = self.client.get('/api/admin/categories/{}/'.format(self.trade.id))
        self.assertEqual(response.status_code, 200)

    def test_data(self):
        response = self.client.get('/api/admin/categories/{}/'.format(self.trade.id))
        data = json.loads(response.content)
        self.assertTrue(len(data), 0)

    def test_parent(self):
        response = self.client.get('/api/admin/categories/{}/'.format(self.trade.id))
        data = json.loads(response.content)
        self.assertEqual(str(self.trade.parent.id), data['parent']['id'])

    def test_children(self):
        response = self.client.get('/api/admin/categories/{}/'.format(self.trade.id))
        data = json.loads(response.content)
        self.assertIsInstance(data['children'], list)
        self.assertEqual(len(data['children']), 2)
        # Forloop comprehension required b/c data['children'] is a nested obj and not a list
        self.assertIn(str(self.trade.children.first().id), [c['id'] for c in data['children']])


class CategoryUpdateTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        # Category
        create_categories()
        self.type = Category.objects.get(name='repair')
        self.trade = Category.objects.get(name='electric')
        self.issue = Category.objects.get(name='outlets')
        self.issue2 = Category.objects.get(name='fans')
        # Data
        serializer = CategorySerializer(self.trade)
        self.data = serializer.data
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_no_change(self):
        response = self.client.put('/api/admin/categories/{}/'.format(self.trade.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 200)

    def test_change_name(self):
        self.data['name'] = 'new category name'
        response = self.client.put('/api/admin/categories/{}/'.format(self.trade.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertNotEqual(self.trade.name, data['name'])

    def test_change_parent(self):
        new_category = mommy.make(Category, name='hvac', subcategory_label='issue', parent=self.type)
        self.data['parent'] = str(new_category.id)
        response = self.client.put('/api/admin/categories/{}/'.format(self.trade.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertNotEqual(str(self.trade.parent.id), data['parent'])

    def test_change_children(self):
        new_sub_category = mommy.make(Category, name='power', subcategory_label='sub_issue', parent=self.trade)
        self.data['children'].append(str(new_sub_category.id))
        response = self.client.put('/api/admin/categories/{}/'.format(self.trade.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertIn(str(new_sub_category.id), data['children'])
        self.assertTrue(self.trade.children.filter(id=new_sub_category.id).exists())


class CategoryCreateTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        # Category
        create_categories()
        self.type = Category.objects.get(name='repair')
        self.trade = Category.objects.get(name='electric')
        self.issue = Category.objects.get(name='outlets')
        self.issue2 = Category.objects.get(name='fans')
        # Data
        serializer = CategorySerializer(self.trade)
        self.data = serializer.data
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_create(self):
        # Change the Trade name, and POST to create a new Trade
        self.data.update({
            'id': str(uuid.uuid4()),
            'name': 'plumbing'
            })
        response = self.client.post('/api/admin/categories/', self.data, format='json')
        data = json.loads(response.content)
        self.assertEqual(response.status_code, 201)
        self.assertIsInstance(Category.objects.get(id=data['id']), Category)

    def test_create_parent(self):
        self.data.update({
            'id': str(uuid.uuid4()),
            'name': 'new category',
            'parent': str(self.type.id)
        })
        response = self.client.post('/api/admin/categories/', self.data, format='json')
        data = json.loads(response.content)
        self.assertEqual(response.status_code, 201)
        self.assertIsInstance(Category.objects.get(id=data['id']), Category)
        self.assertEqual(data['parent'], str(self.type.id))

    def test_create_children(self):
        # Can add Children immediately to a new Category when creating it.
        new_sub_category = mommy.make(Category, name='power', subcategory_label='sub_issue', parent=self.trade)
        self.data.update({
            'id': str(uuid.uuid4()),
            'name': 'new category',
            'parent': None,
            'children': [str(new_sub_category.id)]
        })
        response = self.client.post('/api/admin/categories/', self.data, format='json')
        data = json.loads(response.content)
        self.assertEqual(response.status_code, 201)
        self.assertIn(str(new_sub_category.id), data['children'])
