from django.test import TestCase
from django.db import IntegrityError

from model_mommy import mommy

from category.models import CategoryType


class CategoryTypeTests(TestCase):

    def setUp(self):
        self.issue = mommy.make(CategoryType, name='issue')
        self.trade = mommy.make(CategoryType, name='trade', child=self.issue)
        self.type = mommy.make(CategoryType, name='type', child=self.trade)

    def test_create(self):
        self.assertEqual(CategoryType.objects.count(), 3)

    def test_child(self):
        self.assertEqual(self.trade.child, self.issue)

    def test_parent(self):
        self.assertEqual(self.trade.parent, self.type)

    def test_one_to_one_hierarchy(self):
        # Two CategoryType's can't have the same Child
        with self.assertRaises(IntegrityError):
            trade_other = mommy.make(CategoryType, child=self.issue)


# class CategoryTests()