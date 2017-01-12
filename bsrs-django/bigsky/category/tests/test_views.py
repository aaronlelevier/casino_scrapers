import json
import uuid

from django.conf import settings

from model_mommy import mommy
from rest_framework.test import APITestCase

from category.models import Category, LABEL_TRADE
from category.serializers import CategoryUpdateSerializer
from category.tests.factory import (create_single_category, create_categories,
    create_other_category)
from person.tests.factory import PASSWORD, create_person
from utils import create
from utils.tests.mixins import MockPermissionsAllowAnyMixin


class CategoryViewTestSetupMixin(MockPermissionsAllowAnyMixin):

    def setUp(self):
        super(CategoryViewTestSetupMixin, self).setUp()
        self.password = PASSWORD
        self.person = create_person()
        # Categories
        create_categories()
        self.type = Category.objects.filter(parent__isnull=True).first()
        self.trade = Category.objects.filter(label=LABEL_TRADE).first()
        # Data
        serializer = CategoryUpdateSerializer(self.trade)
        self.data = serializer.data
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        super(CategoryViewTestSetupMixin, self).tearDown()
        self.client.logout()


class CategoryListTests(CategoryViewTestSetupMixin, APITestCase):

    def test_data(self):
        response = self.client.get('/api/admin/categories/')

        self.assertEqual(response.status_code, 200)
        # data
        data = json.loads(response.content.decode('utf8'))
        data = data['results'][0]
        # db object
        category = Category.objects.get(id=data['id'])
        self.assertEqual(data['id'], str(category.id))
        self.assertEqual(data['name'], category.name)
        self.assertEqual(data['description'], category.description)
        self.assertEqual(data['label'], category.label)
        self.assertEqual(data['cost_amount'], category.cost_amount)
        self.assertEqual(data['cost_currency'], str(category.cost_currency.id))
        self.assertEqual(data['cost_code'], category.cost_code)
        self.assertEqual(data['level'], category.level)
        self.assertNotIn('parent', data)
        self.assertNotIn('children', data)

    def test_top_level(self):
        response = self.client.get('/api/admin/categories/')

        data = json.loads(response.content.decode('utf8'))
        self.assertTrue(len(data['results']) > 0)
        self.assertFalse(self.type.parent)
        self.assertTrue(self.type.children)

    def test_power_select_category_name(self):
        category = create_single_category(name='foobar')

        response = self.client.get('/api/admin/categories/category__icontains={}/'.format('foobar'))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['id'], str(category.id))
        self.assertEqual(data['results'][0]['name'], 'foobar')
        self.assertNotIn('parent', data['results'][0]['name'])
        self.assertNotIn('status', data['results'][0]['name'])
        self.assertNotIn('description', data['results'][0])
        self.assertNotIn('label', data['results'][0])

    def test_power_select_category_cost_code(self):
        category = create_single_category(name='nothing')
        category.cost_code = '760521'
        category.save()

        response = self.client.get('/api/admin/categories/category__icontains={}/'.format('760521'))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['id'], str(category.id))
        self.assertEqual(data['results'][0]['cost_code'], str('760521'))

    def test_power_select_category__more_than_10_results(self):
        search_key = 'foo'
        for i in range(11):
            create_single_category(name=search_key + create._generate_chars())
        self.assertTrue(Category.objects.search_power_select(search_key).count() > 10)

        response = self.client.get('/api/admin/categories/?search={}'.format(search_key))

        data = json.loads(response.content.decode('utf8'))
        self.assertTrue(data['count'] > 10)
        self.assertEqual(len(data['results']), settings.PAGE_SIZE)

    def test_search(self):
        category = create_single_category(name='foobar')
        self.assertTrue(Category.objects.count() > 1)

        response = self.client.get('/api/admin/categories/?search={}'.format(category.name))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)

    def test_other_tenants_categories_filtered_out(self):
        create_other_category()
        total_count = Category.objects.count()
        logged_in_user_count = Category.objects.filter(
            tenant=self.person.role.tenant).count()
        self.assertTrue(total_count > logged_in_user_count)

        response = self.client.get('/api/admin/categories/')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], logged_in_user_count)


class CategoryDetailTests(CategoryViewTestSetupMixin, APITestCase):

    def test_response(self):
        response = self.client.get('/api/admin/categories/{}/'.format(self.trade.id))
        self.assertEqual(response.status_code, 200)

    def test_data(self):
        response = self.client.get('/api/admin/categories/{}/'.format(self.trade.id))

        data = json.loads(response.content.decode('utf8'))
        category = Category.objects.get(id=data['id'])
        self.assertEqual(data['id'], str(category.id))
        self.assertEqual(data['name'], category.name)
        self.assertEqual(data['description'], category.description)
        self.assertEqual(data['label'], category.label)
        self.assertEqual(data['subcategory_label'], category.subcategory_label)
        self.assertEqual(data['cost_amount'], category.cost_amount)
        self.assertEqual(data['cost_currency'], str(category.cost_currency.id))
        self.assertEqual(data['cost_code'], category.cost_code)
        self.assertEqual(data['level'], category.level)

    def test_data_parent(self):
        category = Category.objects.filter(label='Issue').first()
        self.assertIsNotNone(category.parent)

        response = self.client.get('/api/admin/categories/{}/'.format(category.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(category.id))
        self.assertIsInstance(data['parent'], dict)
        self.assertEqual(data['parent']['id'], str(category.parent.id))
        self.assertEqual(data['parent']['name'], str(category.parent.name))
        self.assertIn('parent_id', data['parent'])
        self.assertIn('children', data['parent'])
        self.assertIsInstance(data['parent']['children'], list)

    def test_data_children(self):
        category = self.trade
        self.assertTrue(category.children.all())

        response = self.client.get('/api/admin/categories/{}/'.format(category.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(category.id))
        self.assertIsInstance(data['children'], list)
        child = data['children'][0]
        self.assertIsInstance(child, dict)
        self.assertEqual(child['id'], str(category.children.first().id))
        self.assertEqual(child['name'], category.children.first().name)
        self.assertIn('level', child)
        self.assertNotIn('children', child)
        self.assertNotIn('parent', child)

    def test_parents_have_children(self):
        response = self.client.get('/api/admin/categories/{}/'.format(self.type.id))
        data = json.loads(response.content.decode('utf8'))
        self.assertIsNone(data['parent'])

    def test_children_do_not_have_children(self):
        response = self.client.get('/api/admin/categories/{}/'.format(self.trade.id))
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(str(self.trade.parent.id), data['parent']['id'])

    def test_has_parent(self):
        response = self.client.get('/api/admin/categories/{}/'.format(self.trade.id))
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(str(self.trade.parent.id), data['parent']['id'])

    def test_children(self):
        response = self.client.get('/api/admin/categories/{}/'.format(self.trade.id))
        data = json.loads(response.content.decode('utf8'))
        self.assertIsInstance(data['children'], list)
        self.assertTrue(data['children'])
        # Forloop comprehension required b/c data['children'] is a nested obj and not a list
        self.assertIn(str(self.trade.children.first().id), [c['id'] for c in data['children']])

    def test_other_tenants_categories_filtered_out(self):
        other_category = create_other_category()
        self.assertNotEqual(other_category.tenant,
                            self.person.role.tenant)

        response = self.client.get('/api/admin/categories/{}/'
                                   .format(other_category.id))

        self.assertEqual(response.status_code, 404)


class CategoryUpdateTests(CategoryViewTestSetupMixin, APITestCase):

    def test_data(self):
        response = self.client.put('/api/admin/categories/{}/'.format(self.trade.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], self.data['id'])
        self.assertEqual(data['name'], self.data['name'])
        self.assertEqual(data['description'], self.data['description'])
        self.assertEqual(data['label'], self.data['label'])
        self.assertEqual(data['cost_amount'], self.data['cost_amount'])
        self.assertEqual(data['cost_currency'], str(self.data['cost_currency']))
        self.assertEqual(data['cost_code'], self.data['cost_code'])
        self.assertNotIn('tenant', data)
        self.assertEqual(data['parent'], str(self.trade.parent.id))
        # children
        self.assertIsInstance(data['children'], list)
        self.assertIn(
            data['children'][0],
            [str(x) for x in self.trade.children.values_list('id', flat=True)]
        )

    def test_no_change(self):
        response = self.client.put('/api/admin/categories/{}/'.format(self.trade.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)

    def test_change_name(self):
        self.data['name'] = 'new category name'

        response = self.client.put('/api/admin/categories/{}/'.format(self.trade.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertNotEqual(self.trade.name, data['name'])

    def test_name_update_only(self):
        self.data['name'] = 'new category name'
        fields = [x.name for x in Category._meta.get_fields()]
        for field in fields:
            if field not in ['id', 'name']:
                self.data.pop(field, None)

        response = self.client.put('/api/admin/categories/{}/'.format(self.trade.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertNotEqual(self.trade.name, data['name'])

    def test_change_parent(self):
        new_category = mommy.make(Category, name='hvac', subcategory_label='issue', parent=self.type)
        self.data['parent'] = str(new_category.id)

        response = self.client.put('/api/admin/categories/{}/'.format(self.trade.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(str(new_category.id), data['parent'])

    def test_change_children(self):
        new_sub_category = mommy.make(Category, name='power', subcategory_label='sub_issue', parent=self.trade)
        self.data['children'].append(str(new_sub_category.id))

        response = self.client.put('/api/admin/categories/{}/'.format(self.trade.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertIn(str(new_sub_category.id), data['children'])
        self.assertTrue(self.trade.children.filter(id=new_sub_category.id).exists())

    def test_child_added_level_reflects_change(self):
        new_sub_category = create_single_category()
        self.assertEqual(new_sub_category.level, 0)
        serializer = CategoryUpdateSerializer(self.type)
        data = serializer.data
        data['children'] = [new_sub_category.id]

        response = self.client.put('/api/admin/categories/{}/'.format(self.type.id),
            data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(1, len(data['children']))
        child = Category.objects.get(id=data['children'][0])
        self.assertEqual(1, child.level)


class CategoryCreateTests(CategoryViewTestSetupMixin, APITestCase):

    def test_data(self):
        # Change the Trade name, and POST to create a new Trade
        self.data.update({
            'id': str(uuid.uuid4()),
            'name': 'plumbing'
            })

        response = self.client.post('/api/admin/categories/', self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201)
        self.assertEqual(data['id'], self.data['id'])
        self.assertEqual(data['name'], self.data['name'])
        self.assertEqual(data['description'], self.data['description'])
        self.assertEqual(data['label'], self.data['label'])
        self.assertEqual(data['cost_amount'], self.data['cost_amount'])
        self.assertEqual(data['cost_currency'], str(self.data['cost_currency']))
        self.assertEqual(data['cost_code'], self.data['cost_code'])
        category = Category.objects.get(id=data['id'])
        self.assertNotIn('tenant', data)
        self.assertEqual(category.tenant.id, self.person.role.tenant.id)

    def test_create_parent(self):
        self.data.update({
            'id': str(uuid.uuid4()),
            'name': 'new category',
            'parent': str(self.type.id)
        })
        response = self.client.post('/api/admin/categories/', self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
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
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201)
        self.assertIn(str(new_sub_category.id), data['children'])


class CategoryFilterTests(CategoryViewTestSetupMixin, APITestCase):

    # NOTE: These tests are testing the ``FilterRelatedMixin`` with Categories
    # needed API endpoints

    def test_filter_by_parent(self):
        response = self.client.get('/api/admin/categories/?parent={}'.format(self.trade.id))
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], self.trade.children.count())
        self.assertIn('children', data['results'][0])
        self.assertIn('parent_id', data['results'][0])
        self.assertIn('level', data['results'][0])
        self.assertIn('name', data['results'][0])
        self.assertIn('label', data['results'][0])
        self.assertIn('subcategory_label', data['results'][0])

    def test_filter_by_parent_with_page_size(self):
        '''
        This is the behavior of ember power selects that fetch this url on open
        should be greater than PAGE_SIZE=10
        '''
        self.repair = Category.objects.filter(name='Repair').first()
        create_single_category(name='Wat', parent=self.repair)
        self.assertEqual(Category.objects.filter(parent=self.repair.id).count(), 11)
        response = self.client.get('/api/admin/categories/?parent={}&page_size=1000'.format(self.repair.id))
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 11)

    def test_filter_by_name(self):
        create_single_category(name="cat")
        create_single_category(name="dog")
        name = "dog"
        response = self.client.get('/api/admin/categories/?name__icontains={}'.format(name))
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
                data['count'],
                Category.objects.filter(name__icontains=name).count()
        )

    def test_filter_children_isnull__true(self):
        leaf_category_count = Category.objects.filter(children__isnull=True).count()
        self.assertTrue(leaf_category_count > 0)

        response = self.client.get('/api/admin/categories/?children__isnull=true')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], leaf_category_count)

    def test_filter_children_isnull__false(self):
        leaf_category_count = Category.objects.filter(children__isnull=False).count()
        self.assertTrue(leaf_category_count > 0)

        response = self.client.get('/api/admin/categories/?children__isnull=false')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], leaf_category_count)


# Sub Routes

class CategorySubRouteParentsTests(CategoryViewTestSetupMixin, APITestCase):

    def test_filter_top_level_is_paginated(self):
        response = self.client.get('/api/admin/categories/parents/')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], Category.objects.filter(parent__isnull=True).count())
        self.assertIn('results', data)

    def test_filter_top_level_has_children(self):
        response = self.client.get('/api/admin/categories/parents/')
        # data
        data = json.loads(response.content.decode('utf8'))
        data = data['results'][0]
        # db object
        category = Category.objects.filter(parent__isnull=True).first()
        self.assertEqual(data['label'], category.label)
        self.assertEqual(data['subcategory_label'], category.subcategory_label)
        self.assertEqual(data['parent_id'], None)
        self.assertTrue(data['children'][0]['id'])
        self.assertTrue(data['children'][0]['name'])
        self.assertTrue(data['children'][0]['level'])
        self.assertIn('children', data)


class CategorySubRouteSearchTests(CategoryViewTestSetupMixin, APITestCase):

    def test_power_select_category_name(self):
        category = create_single_category(name='foobar')

        response = self.client.get('/api/admin/categories/category__icontains={}/'.format('foobar'))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['id'], str(category.id))
        self.assertEqual(data['results'][0]['name'], 'foobar')
        self.assertNotIn('parent', data['results'][0]['name'])
        self.assertNotIn('status', data['results'][0]['name'])
        self.assertNotIn('description', data['results'][0])
        self.assertNotIn('label', data['results'][0])

    def test_power_select_category_cost_code(self):
        category = create_single_category(name='nothing')
        category.cost_code = '760521'
        category.save()

        response = self.client.get('/api/admin/categories/category__icontains={}/'.format('760521'))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['id'], str(category.id))
        self.assertEqual(data['results'][0]['cost_code'], str('760521'))


class CategorySubRouteAutomationFilterTests(MockPermissionsAllowAnyMixin, APITestCase):

    def setUp(self):
        super(CategorySubRouteAutomationFilterTests, self).setUp()
        self.password = PASSWORD
        self.person = create_person()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        super(CategorySubRouteAutomationFilterTests, self).tearDown()
        self.client.logout()

    def test_data(self):
        parent = create_single_category(name='aaa')
        child = create_single_category(name='aaab', parent=parent)
        grand_child = create_single_category(name='c', parent=child)

        response = self.client.get('/api/admin/categories/automation-criteria/{}/'.format(parent.name))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 2)
        self.assertEqual(data['results'][0]['id'], str(parent.id))
        self.assertEqual(data['results'][0]['name'], str(parent.parents_and_self_as_string()))
        self.assertEqual(data['results'][1]['id'], str(child.id))
        self.assertEqual(data['results'][1]['name'], str(child.parents_and_self_as_string()))

    def test_data__limit_full_list(self):
        create_categories()
        self.assertTrue(Category.objects.count() > settings.PAGE_SIZE)

        response = self.client.get('/api/admin/categories/automation-criteria/{}/'.format('a'))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['results']), settings.PAGE_SIZE)

    def test_data__no_match(self):
        name = 'foobar'
        self.assertFalse(Category.objects.filter(name__icontains=name).exists())

        response = self.client.get('/api/admin/categories/automation-criteria/{}/'.format(name))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['results']), 0)
