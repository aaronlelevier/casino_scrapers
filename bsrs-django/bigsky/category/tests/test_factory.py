from django.test import TestCase, TransactionTestCase
from django.contrib.auth.models import ContentType

from model_mommy import mommy

from category.tests import factory
from category.models import Category, CategoryStatus, CATEGORY_STATUSES
from utils.helpers import generate_uuid


class CreateSingleCategoryTests(TestCase):

    def test_default(self):
        category = factory.create_single_category()

        self.assertTrue(category.name)
        self.assertIsNone(category.parent)

    def test_name(self):
        name = 'My Cool Category'

        category = factory.create_single_category(name)

        self.assertEqual(category.name, name)
        self.assertEqual(category.subcategory_label, 'trade')
        self.assertIsInstance(category.status, CategoryStatus)

    def test_parent(self):
        parent = factory.create_single_category()

        category = factory.create_single_category(parent=parent)

        self.assertEqual(category.parent, parent)
        self.assertEqual(category.label, parent.subcategory_label)


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

    def tearDown(self):
        ContentType.objects.clear_cache()

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


class CategoryTestsForMethod(TransactionTestCase):

    def setUp(self):
        factory.create_categories()

    def tearDown(self):
        ContentType.objects.clear_cache()

    def test_with_four_top_levels(self):
        self.assertEqual(
            Category.objects.filter(parent=None).count(),
            len(factory.TOP_LEVEL_CATEGORIES)
        )
        self.assertEqual(
            Category.objects.filter(parent=None).order_by('name').first().name,
            sorted(factory.TOP_LEVEL_CATEGORIES)[0]
        )
