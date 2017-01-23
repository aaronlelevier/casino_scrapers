from django.contrib.auth.models import ContentType
from django.test import TestCase, TransactionTestCase
from model_mommy import mommy

from category.models import (CATEGORY_STATUSES, LABEL_TRADE, LABEL_TYPE,
                             Category, CategoryStatus, ScCategory)
from category.tests import factory
from tenant.models import Tenant
from tenant.tests.factory import get_or_create_tenant
from utils.helpers import generate_uuid


class CreateRepairCategoryTests(TestCase):

    def test_main(self):
        ret = factory.create_repair_category()

        self.assertEqual(ret.name, factory.REPAIR)
        self.assertEqual(ret.label, LABEL_TYPE)
        self.assertEqual(ret.subcategory_label, LABEL_TRADE)
        self.assertEqual(ret.description, 1)


class CreateSingleCategoryTests(TestCase):

    def test_default(self):
        category = factory.create_single_category()

        self.assertTrue(category.name)
        self.assertIsNone(category.parent)

    def test_attrs(self):
        name = 'My Cool Category'

        category = factory.create_single_category(name=name)

        self.assertEqual(category.name, name)
        self.assertEqual(category.subcategory_label, LABEL_TRADE)
        self.assertIsInstance(category.status, CategoryStatus)
        self.assertIsInstance(category.tenant, Tenant)

    def test_parent(self):
        parent = factory.create_single_category()

        category = factory.create_single_category(parent=parent)

        self.assertEqual(category.parent, parent)
        self.assertEqual(category.label, parent.subcategory_label)

    def test_tenant(self):
        tenant = get_or_create_tenant('bar')

        ret = factory.create_single_category(tenant=tenant)

        self.assertEqual(ret.tenant, tenant)

    def test_can_define_fields(self):
        ret = factory.create_single_category(cost_amount=10)

        self.assertEqual(ret.cost_amount, 10)


class CreateCategoriesTests(TestCase):

    def setUp(cls):
        factory.create_categories()

    def tearDown(cls):
        ContentType.objects.clear_cache()

    def test_type(self):
        raw_data = factory.CATEGORIES[0]

        category = Category.objects.get(name=raw_data[1], label=raw_data[2], description=raw_data[0])

        self.assertIsInstance(category, Category)
        self.assertEqual(raw_data[0], int(category.description))
        self.assertEqual(raw_data[1], category.name)
        self.assertEqual(raw_data[2], category.label)
        self.assertEqual(raw_data[3], category.subcategory_label)
        self.assertEqual(raw_data[4], category.parent)

    def test_trade(self):
        raw_data = factory.CATEGORIES[1]

        category = Category.objects.get(name=raw_data[1], label=raw_data[2], description=raw_data[0])

        self.assertIsInstance(category, Category)
        self.assertEqual(raw_data[0], int(category.description))
        self.assertEqual(raw_data[1], category.name)
        self.assertEqual(raw_data[2], category.label)
        self.assertEqual(raw_data[3], category.subcategory_label)
        self.assertEqual(Category.objects.get(description=raw_data[4]), category.parent)

    def test_issue(self):
        raw_data = factory.CATEGORIES[2]

        category = Category.objects.get(name=raw_data[1], label=raw_data[2], description=raw_data[0])

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

    def test_maintenance__type(self):
        raw_data = next(c for c in factory.CATEGORIES if c[0] == 55)

        category = Category.objects.get(name=raw_data[1], label=raw_data[2], description=raw_data[0])

        self.assertIsInstance(category, Category)
        self.assertEqual(raw_data[0], int(category.description))
        self.assertEqual(raw_data[1], category.name)
        self.assertEqual(raw_data[2], category.label)
        self.assertEqual(raw_data[3], category.subcategory_label)
        self.assertEqual(raw_data[4], category.parent)

    def test_maintenance__trade(self):
        raw_data = next(c for c in factory.CATEGORIES if c[0] == 56)

        category = Category.objects.get(name=raw_data[1], label=raw_data[2], description=raw_data[0])

        self.assertIsInstance(category, Category)
        self.assertEqual(raw_data[0], int(category.description))
        self.assertEqual(raw_data[1], category.name)
        self.assertEqual(raw_data[2], category.label)
        self.assertEqual(raw_data[3], category.subcategory_label)
        self.assertEqual(Category.objects.get(description=raw_data[4]), category.parent)

    def test_maintenance__issue(self):
        raw_data = next(c for c in factory.CATEGORIES if c[0] == 57)

        category = Category.objects.get(name=raw_data[1], label=raw_data[2], description=raw_data[0])

        self.assertIsInstance(category, Category)
        self.assertEqual(raw_data[0], int(category.description))
        self.assertEqual(raw_data[1], category.name)
        self.assertEqual(raw_data[2], category.label)
        self.assertEqual(raw_data[3], category.subcategory_label)
        self.assertEqual(Category.objects.get(description=raw_data[4]), category.parent)

    def test_tenant_exists_on_all_categories(self):
        self.assertEqual(Category.objects.filter(tenant__isnull=True).count(), 0)

    def test_root_categories_have_required_fields(self):
        # required fields on root caterories are: cost_amount, sc_category
        self.assertEqual(
            Category.objects.filter(parent__isnull=True,
                                    cost_amount__isnull=True).count(), 0)
        self.assertEqual(
            Category.objects.filter(parent__isnull=True,
                                    sc_category__isnull=True).count(), 0)
        self.assertEqual(
            Category.objects.filter(parent__isnull=True,
                                    cost_code__isnull=True).count(), 0)


class GetScCategoryOrNone(TestCase):

    def test_get_sc_category_or_none__none(self):
        ret = factory.get_sc_category_or_none(None)
        self.assertIsNone(ret)

    def test_get_sc_category_or_none__sc_category(self):
        sc_name = 'WATER HEATERS'
        ret = factory.get_sc_category_or_none(sc_name)
        self.assertIsInstance(ret, ScCategory)
        self.assertEqual(ret.sc_name, sc_name)
        self.assertEqual(ret.key, 'water.heaters')


class CategoryStatusTests(object):

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


class CreateOtherTenantFactoryTests(TestCase):

    def setUp(self):
        self.tenant = get_or_create_tenant()

    def test_create_other_category(self):
        ret = factory.create_other_category()

        self.assertIsInstance(ret, Category)
        self.assertNotEqual(ret.tenant, self.tenant)
