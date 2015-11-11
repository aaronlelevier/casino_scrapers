from django.test import TestCase
from django.conf import settings

from accounting.models import Currency
from category.models import Category
from category.tests import factory


class CategoryTests(TestCase):

    def setUp(self):
        factory.create_categories()
        self.type = Category.objects.filter(subcategory_label='trade').first()
        self.trade = Category.objects.filter(label='trade').first()
        self.child = Category.objects.filter(subcategory_label='sub_issue').first()

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
