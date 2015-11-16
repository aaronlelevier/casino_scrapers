from django.test import TestCase

from category.tests import factory
from category.models import Category, CategoryStatus, CATEGORY_STATUSES
from utils.helpers import generate_uuid


class CategoryTests(TestCase):

    def setUp(self):
        factory.create_categories()
        self.type = Category.objects.filter(subcategory_label='trade').first()
        self.trade = Category.objects.filter(label='trade').first()

    def test_trade(self):
        self.assertTrue(Category.objects.filter(label='trade'))

    def test_parents(self):
        self.assertTrue(self.trade.parent)
        self.assertIsNotNone(self.trade.status)

    def test_children(self):
        self.assertTrue(self.trade.children)

    def test_category_status_base_id(self):
        factory.create_category_statuses()
        statuses = CategoryStatus.objects.order_by('id')
        incr = 1

        self.assertEqual(
            str(statuses[incr].id),
            generate_uuid(factory.CATEGORY_STATUS_BASE_ID, incr)
        )

    def test_create_category_statuses(self):
        factory.create_category_statuses()

        self.assertEqual(
            len(CATEGORY_STATUSES),
            CategoryStatus.objects.count()
        )

    def test_create_category_status(self):
        ret = factory.create_category_status()

        self.assertEqual(
            len(CATEGORY_STATUSES),
            CategoryStatus.objects.count()
        )
        self.assertIsInstance(ret, CategoryStatus)
        self.assertIn(ret.name, CATEGORY_STATUSES)

    def test_create_category_status__name_not_in_category_statuses(self):
        with self.assertRaises(Exception):
            factory.create_category_status('bob')

    def test_create_category_status__name_arg(self):
        name = CATEGORY_STATUSES[0]
        ret = factory.create_category_status(name)

        self.assertEqual(ret.name, name)
