from django.test import TestCase
from django.conf import settings

from model_mommy import mommy

from accounting.models import Currency
from category.models import Category
from category.tests import factory


class CategoryTests(TestCase):

    def setUp(self):
        factory.create_categories()
        self.type = Category.objects.filter(subcategory_label='trade').first()
        self.trade = Category.objects.filter(label='trade').first()

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
