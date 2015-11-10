from django.test import TestCase

from category.tests import factory
from category.models import Category


class CategoryTests(TestCase):

    def setUp(self):
        factory.create_categories()
        self.type = Category.objects.filter(subcategory_label='trade').first()
        self.trade = Category.objects.filter(label='trade').first()

    def test_trade(self):
        self.assertTrue(Category.objects.filter(label='trade'))

    def test_parents(self):
        self.assertTrue(self.trade.parent)
        self.assertIsNotNone(self.trade.status)

    def test_children(self):
        self.assertTrue(self.trade.children)
