from django.contrib.auth.models import ContentType
from django.test import TestCase, TransactionTestCase

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

        self.type = mommy.make(
            Category,
            id=generate_uuid(Category),
            name='repair',
            subcategory_label='trade'
        )

        self.trade = mommy.make(
            Category,
            id=generate_uuid(Category),
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


class CreateCategoriesTests(TestCase):

    @classmethod
    def setUpClass(cls):
        factory.create_categories()

    @classmethod
    def tearDownClass(cls):
        ContentType.objects.clear_cache()

    def test_type(self):
        raw_data = factory.CATEGORIES[0]

        category = Category.objects.get(name=raw_data[1], label=raw_data[2])

        self.assertIsInstance(category, Category)
        self.assertEqual(raw_data[0], int(category.description))
        self.assertEqual(raw_data[1], category.name)
        self.assertEqual(raw_data[2], category.label)
        self.assertEqual(raw_data[3], category.subcategory_label)
        self.assertEqual(raw_data[4], category.parent)

    def test_trade(self):
        raw_data = factory.CATEGORIES[1]

        category = Category.objects.get(name=raw_data[1], label=raw_data[2])

        self.assertIsInstance(category, Category)
        self.assertEqual(raw_data[0], int(category.description))
        self.assertEqual(raw_data[1], category.name)
        self.assertEqual(raw_data[2], category.label)
        self.assertEqual(raw_data[3], category.subcategory_label)
        self.assertEqual(Category.objects.get(description=raw_data[4]), category.parent)

    def test_issue(self):
        raw_data = factory.CATEGORIES[2]

        category = Category.objects.get(name=raw_data[1], label=raw_data[2])

        self.assertIsInstance(category, Category)
        self.assertEqual(raw_data[0], int(category.description))
        self.assertEqual(raw_data[1], category.name)
        self.assertEqual(raw_data[2], category.label)
        self.assertEqual(raw_data[3], category.subcategory_label)
        self.assertEqual(Category.objects.get(description=raw_data[4]), category.parent)

    def test_sub_issue(self):
        raw_names = [x[1] for x in factory.CATEGORIES]

        db_names = Category.objects.values_list('name', flat=True)

        for name in raw_names:
            self.assertIn(name, db_names)
