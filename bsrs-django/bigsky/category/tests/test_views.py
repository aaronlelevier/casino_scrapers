import json
import uuid

from model_mommy import mommy
from rest_framework.test import APITestCase

from category import serializers
from category.models import Category
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
        self.assertIn(str(self.trade.children.first().id), [c['id'] for c in data['children']])


# class CategoryUpdateTests(APITestCase):

#     def setUp(self):
#         self.password = PASSWORD
#         self.person = create_person()
#         # Category
#         create_categories()
#         # Login
#         self.client.login(username=self.person.username, password=PASSWORD)
#         # Test Category
#         self.category = Category.objects.filter(type=self.category_type).first()
#         self.data = serializers.CategorySerializer(self.category).data

#     def tearDown(self):
#         self.client.logout()

#     def test_no_change(self):
#         print self.data
#         response = self.client.put('/api/admin/categories/{}/'.format(self.category.id),
#             self.data, format='json')
#         self.assertEqual(response.status_code, 200)

#     def test_change_name(self):
#         response = self.client.get('/api/admin/categories/{}/'.format(self.category.id))
#         data = json.loads(response.content)
#         data['name'] = 'new category name'
#         response = self.client.put('/api/admin/categories/{}/'.format(self.category.id),
#             data, format='json')
#         self.assertEqual(response.status_code, 200)
#         data = json.loads(response.content)
#         self.assertNotEqual(self.category.name, data['name'])

#     def test_change_parent(self):
#         response = self.client.get('/api/admin/categories/{}/'.format(self.category.id))
#         data = json.loads(response.content)
#         new_category = Category.objects.create(name='new_category')
#         data['parent'] = str(new_category.id)
#         response = self.client.put('/api/admin/categories/{}/'.format(self.category.id),
#             data, format='json')
#         self.assertEqual(response.status_code, 200)
#         data = json.loads(response.content)
#         self.assertNotEqual(str(self.category.parent.id), data['parent'])

#     def test_change_subcategories(self):
#         response = self.client.get('/api/admin/categories/{}/'.format(self.category.id))
#         data = json.loads(response.content)
#         new_sub_category = Category.objects.create(name='new_sub_category')
#         data['subcategories'] = [str(new_sub_category.id)]
#         response = self.client.put('/api/admin/categories/{}/'.format(self.category.id),
#             data, format='json')
#         self.assertEqual(response.status_code, 200)
#         data = json.loads(response.content)
#         self.assertNotIn(str(new_sub_category.id), data['subcategories'])


# class CategoryCreateTests(APITestCase):

#     def setUp(self):
#         self.password = PASSWORD
#         self.person = create_person()
#         # Category
#         create_categories()
#         self.category = Category.objects.filter(type=self.category_type).first()
#         # Login
#         self.client.login(username=self.person.username, password=PASSWORD)

#     def tearDown(self):
#         self.client.logout()

#     def test_create(self):
#         category = {
#             'id': str(uuid.uuid4()),
#             'name': 'new category',
#             'parent': None
#         }
#         response = self.client.post('/api/admin/categories/', category, format='json')
#         data = json.loads(response.content)
#         self.assertEqual(response.status_code, 201)
#         self.assertIsInstance(
#             Category.objects.get(id=category['id']),
#             Category
#         )

#     def test_create_parent(self):
#         category = {
#             'id': str(uuid.uuid4()),
#             'name': 'new category',
#             'parent': str(self.category.id)
#         }
#         response = self.client.post('/api/admin/categories/', category, format='json')
#         data = json.loads(response.content)
#         self.assertEqual(response.status_code, 201)
#         self.assertIsInstance(
#             Category.objects.get(id=category['id']),
#             Category
#         )

#     def test_create_subcategories(self):
#         # Can't add 'subcategories' b/c 'subcategories' are read only
#         new_sub_category = mommy.make(Category, type=self.category_type)
#         category = {
#             'id': str(uuid.uuid4()),
#             'name': 'new category',
#             'parent': None,
#             'subcategories': [str(new_sub_category.id)]
#         }
#         response = self.client.post('/api/admin/categories/', category, format='json')
#         data = json.loads(response.content)
#         self.assertEqual(response.status_code, 201)
#         self.assertNotIn(str(new_sub_category.id), data['subcategories'])
