from django.test import TestCase
from provider.tests import factory
from provider.models import Provider
from category.models import Category
from category.tests.factory import create_categories


class FactoryTest(TestCase):

    def setUp(self):
        create_categories()

    def test_create_provider(self):
        category = Category.objects.filter(children__isnull=True).first()
        obj = factory.create_provider(category)
        self.assertIsInstance(obj, Provider)
        # The category is the Trade
        self.assertIsInstance(obj.categories.first(), Category)
        self.assertEqual(obj.categories.first().children.count(), 0, 'This is a leaf node')
        self.assertIsNotNone(obj.fbid)

    def test_create_providers(self):
        list_set = factory.create_providers()
        self.assertTrue(list_set.count() > 0)
        self.assertEqual(list_set.distinct('name').count(), list_set.count())

