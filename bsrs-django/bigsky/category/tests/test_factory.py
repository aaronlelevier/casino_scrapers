from django.test import TestCase
from django.db import IntegrityError

from category.tests import factory
from category.models import Category


class CategoryTests(TestCase):

    def setUp(self):
        factory.create_categories()
        self.type = Category.objects.get(name='repair')
        self.trade = Category.objects.get(name='electric')
        self.issue = Category.objects.get(name='outlets')
        self.issue2 = Category.objects.get(name='fans')

    def test_count(self):
        self.assertEqual(Category.objects.count(), 4)

    def test_parents(self):
        self.assertEqual(self.trade.parent, self.type)

    def test_children(self):
        self.assertEqual(self.trade.children.count(), 2)
