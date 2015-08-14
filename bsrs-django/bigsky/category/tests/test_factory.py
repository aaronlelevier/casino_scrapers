from django.test import TestCase
from django.db import IntegrityError

from category.tests import factory
from category.models import CategoryType


class CategoryTypeTests(TestCase):

    def setUp(self):
        factory.create_category_types()

    def test_create(self):
        self.assertEqual(CategoryType.objects.count(), 3)


class CategoryTests(TestCase):

    def setUp(self):
        factory.create_categories()
        # CategoryTypes
        self.type = CategoryType.objects.get(name='type')
        self.trade = CategoryType.objects.get(name='trade')
        self.issue = CategoryType.objects.get(name='issue')

    def test_create(self):
        self.assertEqual(Category.objects.filter(type=self.type).count(), 2)
        self.assertEqual(Category.objects.filter(type=self.trade).count(), 4)
        self.assertEqual(Category.objects.filter(type=self.issue).count(), 8)