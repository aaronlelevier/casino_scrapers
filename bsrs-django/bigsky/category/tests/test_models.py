from django.test import TestCase
from django.db import IntegrityError

from model_mommy import mommy

from category.models import CategoryType, Category
from category.tests.factory import create_category_types


class CategoryTypeTests(TestCase):

    def setUp(self):
        self.type = mommy.make(CategoryType, name='type')
        self.trade = mommy.make(CategoryType, name='trade', parent=self.type)
        self.issue = mommy.make(CategoryType, name='issue', parent=self.trade)

    def test_create(self):
        self.assertEqual(CategoryType.objects.count(), 3)

    def test_child(self):
        self.assertEqual(self.trade.child, self.issue)

    def test_parent(self):
        self.assertEqual(self.trade.parent, self.type)

    def test_one_to_one_hierarchy(self):
        # Two CategoryType's can't have the same Child
        with self.assertRaises(IntegrityError):
            trade_other = mommy.make(CategoryType, parent=self.type)


class CategoryTests(TestCase):

    def setUp(self):
        # CategoryType
        self.type = mommy.make(CategoryType, name='type')
        self.trade = mommy.make(CategoryType, name='trade', parent=self.type)
        self.issue = mommy.make(CategoryType, name='issue', parent=self.trade)

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

