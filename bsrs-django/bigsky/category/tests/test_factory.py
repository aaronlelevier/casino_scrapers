import random

from django.test import TransactionTestCase

from model_mommy import mommy

from category.tests import factory
from category.models import Category, CategoryStatus, CATEGORY_STATUSES
from utils.helpers import generate_uuid


class CategoryTests(TransactionTestCase):

    def setUp(self):
        self.statuses = factory.create_category_statuses()

        incr = Category.objects.count()
        self.type = mommy.make(
            Category,
            id=generate_uuid(factory.CATEGORY_BASE_ID, incr),
            name='repair',
            subcategory_label='trade'
        )

        incr = Category.objects.count()
        self.trade = mommy.make(
            Category,
            id=generate_uuid(factory.CATEGORY_BASE_ID, incr+1),
            name='plumbing',
            subcategory_label='issue',
            parent=self.type
        )

    def test_trade(self):
        self.assertTrue(Category.objects.filter(label='trade'))

    def test_parents(self):
        self.assertTrue(self.trade.parent)
        self.assertIsNotNone(self.trade.status)

    def test_children(self):
        self.assertTrue(self.trade.children)

    def test_category_status_base_id(self):
        incr = 1

        self.assertEqual(
            str(self.statuses[incr].id),
            generate_uuid(factory.CATEGORY_STATUS_BASE_ID, incr)
        )

    def test_create_category_statuses(self):
        statuses = factory.create_category_statuses()

        self.assertEqual(
            len(CATEGORY_STATUSES),
            len(statuses)
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
