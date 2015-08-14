from django.test import TestCase
from django.db import IntegrityError

from category.tests import factory
from category.models import CategoryType


class CategoryTypeTests(TestCase):

    def setUp(self):
        factory.create_category_types()

    def test_create(self):
        self.assertEqual(CategoryType.objects.count(), 3)