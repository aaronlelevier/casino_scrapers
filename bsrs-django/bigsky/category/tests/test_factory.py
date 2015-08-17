from django.test import TestCase
from django.db import IntegrityError

from category.tests import factory
from category.models import Category


class CategoryTests(TestCase):

    def setUp(self):
        # Parent Categories
        type = Category.objects.get(name='type')
        trade = Category.objects.get(name='trade')
        issue = Category.objects.get(name='issue')

    def test_create(self):
        self.assertEqual(Category.objects.filter(type=self.type).count(), 2)
        self.assertEqual(Category.objects.filter(type=self.trade).count(), 4)
        self.assertEqual(Category.objects.filter(type=self.issue).count(), 8)