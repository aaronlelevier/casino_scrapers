import json
import uuid

from model_mommy import mommy
from rest_framework.test import APITestCase

from category.models import CategoryType, Category
from category.tests.factory import create_category_types, create_categories
from person.tests.factory import PASSWORD, create_person


### CATEGORY TYPE

class CategoryTypeListTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        # CategoryTypes
        create_category_types()
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_response(self):
        response = self.client.get('/api/admin/category_types/')
        self.assertEqual(response.status_code, 200)

    def test_data(self):
        response = self.client.get('/api/admin/category_types/')
        data = json.loads(response.content)
        self.assertTrue(len(data['results']), 0)


class CategoryTypeDetailTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        # CategoryTypes
        create_category_types()
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_response(self):
        ct = CategoryType.objects.get(name='trade')
        response = self.client.get('/api/admin/category_types/{}/'.format(ct.id))
        self.assertEqual(response.status_code, 200)

    def test_data(self):
        ct = CategoryType.objects.get(name='trade')
        response = self.client.get('/api/admin/category_types/{}/'.format(ct.id))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['id'], str(ct.id))


class CategoryTypeUpdateTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        # CategoryTypes
        create_category_types()
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_no_change(self):
        ct = CategoryType.objects.get(name='trade')
        response = self.client.get('/api/admin/category_types/{}/'.format(ct.id))
        data = json.loads(response.content)
        response = self.client.put('/api/admin/category_types/{}/'.format(ct.id), data, format='json')
        self.assertEqual(response.status_code, 200)

    def test_change(self):
        # Replace CategoryType 'name', and test that update worked
        ct = CategoryType.objects.get(name='trade')
        response = self.client.get('/api/admin/category_types/{}/'.format(ct.id))
        data = json.loads(response.content)
        data['name'] = 'some new name'
        response = self.client.put('/api/admin/category_types/{}/'.format(ct.id), data, format='json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertNotEqual(ct.name, data['name'])

    def test_parent(self):
        # Change 'issue' parent from 'trade' to 'trade_other'
        trade_other = CategoryType.objects.create(name='trade_other')
        issue = CategoryType.objects.get(name='issue')
        response = self.client.get('/api/admin/category_types/{}/'.format(issue.id))
        data = json.loads(response.content)
        data['parent'] = str(trade_other.id)
        response = self.client.put('/api/admin/category_types/{}/'.format(issue.id), data, format='json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertNotEqual(str(issue.parent.id), data['parent'])

    def test_child(self):
        # Should raise an Error b/c 'child' is a read_only field.
        sub_issue = CategoryType.objects.create(name='sub_issue')
        issue = CategoryType.objects.get(name='issue')
        response = self.client.get('/api/admin/category_types/{}/'.format(issue.id))
        data = json.loads(response.content)
        data['child'] = str(sub_issue.id)
        response = self.client.put('/api/admin/category_types/{}/'.format(issue.id), data, format='json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertNotEqual(data['child'], str(sub_issue.id))


class CategoryTypeCreateTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        # CategoryTypes
        create_category_types()
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_create(self):
        ct_name = 'sub_issue'
        data = {
            'id': str(uuid.uuid4()),
            'name': ct_name,
            'parent': None,
            'child': None
        }
        response = self.client.post('/api/admin/category_types/', data, format='json')
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content)
        self.assertEqual(data['name'], ct_name)

    def test_create_parent(self):
        issue = CategoryType.objects.get(name='issue')
        ct_name = 'sub_issue'
        data = {
            'id': str(uuid.uuid4()),
            'name': ct_name,
            'parent': str(issue.id),
            'child': None
        }
        response = self.client.post('/api/admin/category_types/', data, format='json')
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content)
        self.assertEqual(data['name'], ct_name)
        self.assertEqual(data['parent'], str(issue.id))


    def test_create_child(self):
        # Child ``CategoryType`` not added b/c 'child' is a read_only field
        sub_sub_issue = CategoryType.objects.create(name='sub_sub_issue')
        ct_name = 'sub_issue'
        data = {
            'id': str(uuid.uuid4()),
            'name': ct_name,
            'parent': None,
            'child': str(sub_sub_issue.id)
        }
        response = self.client.post('/api/admin/category_types/', data, format='json')
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content)
        self.assertEqual(data['name'], ct_name)
        self.assertNotEqual(data['child'], str(sub_sub_issue.id))


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
        self.assertTrue(len(data), 0)


class CategoryDetailTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        # Category
        create_categories()
        self.category_type = CategoryType.objects.get(name='trade')
        self.category = Category.objects.filter(type=self.category_type).first()
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_response(self):
        response = self.client.get('/api/admin/categories/{}/'.format(self.category.id))
        self.assertEqual(response.status_code, 200)

    def test_data(self):
        response = self.client.get('/api/admin/categories/{}/'.format(self.category.id))
        data = json.loads(response.content)
        self.assertTrue(len(data), 0)

    def test_parent(self):
        response = self.client.get('/api/admin/categories/{}/'.format(self.category.id))
        data = json.loads(response.content)
        self.assertEqual(str(self.category.parent.id), data['parent'])

    def test_subcategories(self):
        response = self.client.get('/api/admin/categories/{}/'.format(self.category.id))
        data = json.loads(response.content)
        self.assertTrue(len(data['subcategories']) > 1)


class CategoryUpdateTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        # Category
        create_categories()
        self.category_type = CategoryType.objects.get(name='trade')
        self.category = Category.objects.filter(type=self.category_type).first()
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_no_change(self):
        response = self.client.get('/api/admin/categories/{}/'.format(self.category.id))
        data = json.loads(response.content)
        response = self.client.put('/api/admin/categories/{}/'.format(self.category.id),
            data, format='json')
        self.assertEqual(response.status_code, 200)

    def test_change_name(self):
        response = self.client.get('/api/admin/categories/{}/'.format(self.category.id))
        data = json.loads(response.content)
        data['name'] = 'new category name'
        response = self.client.put('/api/admin/categories/{}/'.format(self.category.id),
            data, format='json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertNotEqual(self.category.name, data['name'])

    def test_change_parent(self):
        response = self.client.get('/api/admin/categories/{}/'.format(self.category.id))
        data = json.loads(response.content)
        new_category = Category.objects.create(name='new_category')
        data['parent'] = str(new_category.id)
        response = self.client.put('/api/admin/categories/{}/'.format(self.category.id),
            data, format='json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertNotEqual(str(self.category.parent.id), data['parent'])

    def test_change_subcategories(self):
        response = self.client.get('/api/admin/categories/{}/'.format(self.category.id))
        data = json.loads(response.content)
        new_sub_category = Category.objects.create(name='new_sub_category')
        data['subcategories'] = [str(new_sub_category.id)]
        response = self.client.put('/api/admin/categories/{}/'.format(self.category.id),
            data, format='json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertNotIn(str(new_sub_category.id), data['subcategories'])


class CategoryCreateTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        # Category
        create_categories()
        self.category_type = CategoryType.objects.get(name='trade')
        self.category = Category.objects.filter(type=self.category_type).first()
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_create(self):
        category = {
            'id': str(uuid.uuid4()),
            'name': 'new category',
            'parent': None
        }
        response = self.client.post('/api/admin/categories/', category, format='json')
        data = json.loads(response.content)
        self.assertEqual(response.status_code, 201)
        self.assertIsInstance(
            Category.objects.get(id=category['id']),
            Category
        )

    def test_create_parent(self):
        category = {
            'id': str(uuid.uuid4()),
            'name': 'new category',
            'parent': str(self.category.id)
        }
        response = self.client.post('/api/admin/categories/', category, format='json')
        data = json.loads(response.content)
        self.assertEqual(response.status_code, 201)
        self.assertIsInstance(
            Category.objects.get(id=category['id']),
            Category
        )

    def test_create_subcategories(self):
        # Can't add 'subcategories' b/c 'subcategories' are read only
        new_sub_category = mommy.make(Category, type=self.category_type)
        category = {
            'id': str(uuid.uuid4()),
            'name': 'new category',
            'parent': None,
            'subcategories': [str(new_sub_category.id)]
        }
        response = self.client.post('/api/admin/categories/', category, format='json')
        data = json.loads(response.content)
        self.assertEqual(response.status_code, 201)
        self.assertNotIn(str(new_sub_category.id), data['subcategories'])
