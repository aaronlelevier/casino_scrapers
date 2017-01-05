from django.test import TestCase

from category.models import Category
from location.models import LocationLevel
from tenant.tests.factory import get_or_create_tenant
from utils_transform.trole.models import DominoRole
from utils_transform.trole.tests import factory


class FactoryTests(TestCase):

    def setUp(self):
        self.tenant = get_or_create_tenant('foo')

    def test_get_role_none_id_fields(self):
        raw_ret = [f.name for f in DominoRole._meta.get_fields()
                   if f.name != 'id']

        ret = factory.get_role_none_id_fields()

        self.assertEqual(raw_ret, ret)

    def test_get_random_data(self):
        fields = factory.get_role_none_id_fields()

        ret = factory.get_random_data(fields)

        for f in fields:
            self.assertIsInstance(ret[f], str)
            self.assertTrue(ret[f])

    def test_create_domino_role(self):
        ret = factory.create_domino_role()

        self.assertIsInstance(ret, DominoRole)
        self.assertEqual(ret.selection, factory.ROLE_SELECTION)
        self.assertEqual(ret.categories, factory.CATEGORIES)

        other_fields = ['name', 'manage_role_names', 'tsg_start_point']
        for field in other_fields:
            value = getattr(ret, field)
            self.assertTrue(value)
            self.assertIsInstance(value, str)
            self.assertEqual(len(value), 10)

    def test_create_domino_role__selection(self):
        selection = 'foo'
        ret = factory.create_domino_role(selection=selection)
        self.assertEqual(ret.selection, selection)

    def test_create_domino_role_and_related(self):
        ret = factory.create_domino_role_and_related(self.tenant)

        self.assertIsInstance(ret, DominoRole)
        self.assertEqual(ret.selection, factory.ROLE_SELECTION)
        self.assertTrue(DominoRole.objects.count() > 0)
        self.assertIsInstance(LocationLevel.objects.get(name=factory.LOCATION_REGION), LocationLevel)
        self.assertIsInstance(Category.objects.get(name=factory.CATEGORY1), Category)
        self.assertIsInstance(Category.objects.get(name=factory.CATEGORY2), Category)

    def test_create_domino_role_and_related__selection(self):
        selection = 'foo'
        ret = factory.create_domino_role_and_related(self.tenant, selection=selection)
        self.assertEqual(ret.selection, selection)
