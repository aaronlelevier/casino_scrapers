from django.test import TestCase

from category.models import Category
from category.tests.factory import create_categories
from provider.tests import factory
from provider.models import Provider


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
        self.assertTrue(obj.address1)
        self.assertTrue(obj.address2)
        self.assertTrue(obj.city)
        self.assertTrue(obj.email)
        self.assertTrue(obj.logo)
        self.assertTrue(obj.phone)
        self.assertTrue(obj.postal_code)
        self.assertTrue(obj.state)

    def test_create_provider_with_all_categories(self):
        ret = factory.create_provider_with_all_categories()

        self.assertIsInstance(ret, Provider)
        self.assertEqual(
            ret.categories.count(),
            Category.objects.filter(children__isnull=True).count()
        )
        self.assertRegexpMatches(ret.name, r'^Joe')
        for k,v in factory.PROVIDER_FIXTURE_DATA.items():
            self.assertEqual(getattr(ret, k), v,
                             '{} != {}'.format(getattr(ret, k), v))

    def test_create_providers(self):
        list_set = factory.create_providers()

        self.assertTrue(list_set.count() > 0)
        self.assertEqual(list_set.distinct('name').count(), list_set.count())
        self.assertEqual(
            Category.objects.filter(children__isnull=True,
                                    providers__isnull=True).count(), 0)
