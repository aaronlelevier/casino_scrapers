from django.test import TestCase
from django.db import IntegrityError

from model_mommy import mommy

from category.models import Category


class CategoryTests(TestCase):

    def setUp(self):
        # Parent Categories
        type = Category.objects.get(name='type')
        trade = Category.objects.get(name='trade')
        issue = Category.objects.get(name='issue')

        # Category
        # Type
        [mommy.make(Category, type=self.type) for i in range(2)]
        # Trades
        for type in Category.objects.filter(type=self.type):
            for i in range(2):
                mommy.make(Category, type=self.trade, parent=type)
        # Issues
        for trade in Category.objects.filter(type=self.trade):
            for i in range(2):
                mommy.make(Category, type=self.issue, parent=trade)

    def test_create(self):
        self.assertEqual(Category.objects.filter(type=self.issue).count(), 2)

    def test_create(self):
        self.assertEqual(Category.objects.filter(type=self.type).count(), 2)
        self.assertEqual(Category.objects.filter(type=self.trade).count(), 4)
        self.assertEqual(Category.objects.filter(type=self.issue).count(), 8)

    def test_children(self):
        trade = Category.objects.filter(type=self.trade).first()
        self.assertEqual(trade.children.all().count(), 2)

    def test_parent(self):
        trade = Category.objects.filter(type=self.trade).first()
        self.assertIsInstance(trade.parent, Category)
        self.assertEqual(trade.parent.type, self.type)

