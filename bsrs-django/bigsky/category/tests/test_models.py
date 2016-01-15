from django.test import TestCase
from django.conf import settings

from accounting.models import Currency
from category.models import Category
from category.tests import factory
from person.tests.factory import create_single_person


class CategorySetupMixin(object):

    def setUp(self):
        factory.create_categories()
        self.type = Category.objects.filter(subcategory_label='trade').first()
        self.trade = Category.objects.filter(label='trade').first()
        self.child = Category.objects.filter(subcategory_label='sub_issue').first()


class CategoryManagerTests(TestCase):

    def setUp(self):
        self.repair = factory.create_single_category('repair')
        self.store = factory.create_single_category('store', self.repair)
        self.windows = factory.create_single_category('windows', self.store)

        self.person = create_single_person()
        self.role = self.person.role
        self.role.categories.add(self.store)
        self.role.categories.add(self.windows)

    def test_get_all_children(self):
        ret = self.person.role.categories.objects_and_their_children()

        self.assertEqual(len(ret), 3)


class CategoryTests(CategorySetupMixin, TestCase):

    def test_label_top_level(self):
        self.assertIsNone(self.type.parent)
        self.assertEqual(self.type.label, settings.TOP_LEVEL_CATEGORY_LABEL)

    def test_label_none_top_level(self):
        self.assertIsNotNone(self.trade.parent)
        self.assertEqual(self.trade.label, self.trade.parent.subcategory_label)

    def test_currency(self):
        self.assertIsInstance(self.trade.cost_currency, Currency)

    def test_to_dict(self):
        d = self.type.to_dict()
        self.assertIsInstance(d, dict)
        self.assertIn('id', d)
        self.assertIn('parent', d)
        self.assertEqual(d['parent'], None)

    def test_to_dict_with_parent(self):
        d = self.child.to_dict()
        self.assertIsInstance(d, dict)
        self.assertIn('id', d)
        self.assertIn('parent', d)
        self.assertEqual(d['parent']['id'], str(self.child.parent.pk))
        self.assertEqual(d['parent']['name'], self.child.parent.name)

    def test_to_simple_dict(self):
        d = self.type.to_simple_dict()

        self.assertEqual(d['id'], str(self.type.id))
        self.assertEqual(d['name'], self.type.name)
        self.assertIsNone(d['parent'])

    def test_to_simple_dict_with_parent(self):
        d = self.child.to_simple_dict()

        self.assertEqual(d['id'], str(self.child.id))
        self.assertEqual(d['name'], self.child.name)
        self.assertEqual(d['parent'], str(self.child.parent.id))


class CategoryLevelTests(CategorySetupMixin, TestCase):

    def test_set_level__no_parents(self):
        self.assertEqual(self.type._set_level(), 0)

    def test_set_level__one_parent(self):
        self.assertTrue(self.trade.parent)
        self.assertFalse(self.trade.parent.parent)
        self.assertEqual(self.trade._set_level(), 1)

    def test_set_level__two_parent(self):
        self.assertTrue(self.child.parent)
        self.assertTrue(self.child.parent.parent)
        self.assertFalse(self.child.parent.parent.parent)
        self.assertEqual(self.child._set_level(), 2)

    def test_level__type(self):
        self.assertEqual(self.type.level, 0)

    def test_level__trade(self):
        self.assertEqual(self.trade.level, 1)

    def test_level__child(self):
        self.assertEqual(self.child.level, 2)

    def test_add_category_changes_level(self):
        parent = factory.create_single_category()
        child = factory.create_single_category()
        self.assertEqual(parent.level, 0)
        self.assertEqual(child.level, 0)

        parent.children.add(child)

        self.assertEqual(parent.level, 0)
        # self.assertEqual(child.level, 1)
