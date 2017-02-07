import os
import random

from django.conf import settings
from django.db.models import Q
from django.test import TestCase

from accounting.models import Currency
from category.models import (Category, CategoryManager, CategoryQuerySet,
                             CategoryStatus, SC_TRADES_CSV, ScCategory, ScCategoryManager)
from category.tests import factory
from person.tests.factory import create_single_person
from tenant.tests.factory import get_or_create_tenant
from utils.models import DefaultNameManager
from utils.tests.test_helpers import create_default


class CategorySetupMixin(object):

    def setUp(self):
        self.type = factory.create_single_category()
        self.trade = factory.create_single_category(parent=self.type)
        self.child = factory.create_single_category(parent=self.trade)
        # Category Status
        self.statuses = CategoryStatus.objects.all()


class CategoryStatusTests(TestCase):

    def setUp(self):
        self.default_status = create_default(CategoryStatus)

    def test_default(self):
        self.assertEqual(CategoryStatus.objects.default(), self.default_status)

    def test_manager(self):
        self.assertIsInstance(CategoryStatus.objects, DefaultNameManager)

    def test_meta__verbose_name_plural(self):
        self.assertEqual(CategoryStatus._meta.verbose_name_plural, "Category statuses")


class CategoryManagerTests(TestCase):

    def setUp(self):
        self.repair = factory.create_single_category(factory.REPAIR)
        self.store = factory.create_single_category('store', self.repair)
        self.windows = factory.create_single_category('windows', self.store)

        self.person = create_single_person()
        self.role = self.person.role
        self.role.categories.add(self.store)
        self.role.categories.add(self.windows)

    def test_objects_and_their_children(self):
        ret = self.person.role.categories.objects_and_their_children()

        self.assertEqual(len(ret), 3)

    def test_queryset_cls(self):
        self.assertEqual(CategoryManager.queryset_cls, CategoryQuerySet)

    def test_get_all_if_none(self):
        for c in self.person.role.categories.all():
            self.person.role.categories.remove(c)

        ret = self.person.role.categories.get_all_if_none(self.person.role)

        self.assertEqual(len(ret), Category.objects.count())

    def test_get_all_if_none__related_exist(self):
        count = self.person.role.categories.count()
        self.assertTrue(count)
        self.assertNotEqual(count, Category.objects.count())

        ret = self.person.role.categories.get_all_if_none(self.person.role)

        self.assertEqual(len(ret), count)

    def test_search_multi(self):
        keyword = self.repair.name
        raw_ret = Category.objects.filter(
            Q(name__icontains=keyword) | \
            Q(description__icontains=keyword) | \
            Q(label__icontains=keyword) | \
            Q(cost_code__icontains=keyword)
        )

        ret = Category.objects.search_multi(keyword)

        self.assertEqual(ret.count(), raw_ret.count())


class CategoryTests(CategorySetupMixin, TestCase):

    def test_export_fields(self):
        export_fields = ['name', 'description', 'label', 'cost_amount', 'cost_code']

        self.assertEqual(Category.EXPORT_FIELDS, export_fields)

    def test_i18n_header_fields(self):
        raw_headers = [
            ('name', 'admin.category.label.name'),
            ('description', 'admin.category.label.description'),
            ('label', 'admin.category.label.label'),
            ('cost_amount', 'admin.category.label.cost_amount'),
            ('cost_code', 'admin.category.label.cost_code')
        ]

        ret = Category.I18N_HEADER_FIELDS

        self.assertEqual(ret, [x[1] for x in raw_headers])

    def test_filter_export_data__queryset_matches_export_fields(self):
        category = Category.objects.filter_export_data().first()
        for f in Category.EXPORT_FIELDS:
            self.assertTrue(hasattr(category, f))

    def test_label__no_parent_no_label_set(self):
        tenant = get_or_create_tenant()
        category = Category.objects.create(
            name='foo',
            status=random.choice(self.statuses),
            tenant=tenant
        )

        self.assertIsNone(category.parent)
        self.assertEqual(category.label, settings.TOP_LEVEL_CATEGORY_LABEL)
        self.assertEqual(category.subcategory_label, "")

    def test_label__has_parent_but_no_label_set(self):
        subcategory_label = 'bar'
        tenant = get_or_create_tenant()
        parent = Category.objects.create(
            name='foo',
            status=random.choice(self.statuses),
            subcategory_label=subcategory_label,
            tenant=tenant
        )
        category = Category.objects.create(
            name='foo',
            status=random.choice(self.statuses),
            parent=parent,
            tenant=tenant
        )

        self.assertEqual(category.parent, parent)
        self.assertEqual(category.label, subcategory_label)

    def test_top_level_label__explicit(self):
        label = 'foo'
        subcategory_label = 'bar'
        tenant = get_or_create_tenant()
        category = Category.objects.create(
            name='my new category',
            label=label,
            subcategory_label=subcategory_label,
            status=random.choice(self.statuses),
            tenant=tenant
        )

        self.assertIsNone(category.parent)
        self.assertEqual(category.label, label)
        self.assertEqual(category.subcategory_label, subcategory_label)

    def test_label_none_top_level(self):
        self.assertIsNotNone(self.trade.parent)
        self.assertEqual(self.trade.label, self.trade.parent.subcategory_label)

    def test_currency(self):
        self.assertIsInstance(self.trade.cost_currency, Currency)

    def test_inherited(self):
        ret = self.type.inherited

        self.assertEqual(ret['cost_amount'], self.type.proxy_cost_amount)
        self.assertEqual(ret['cost_code'], self.type.proxy_cost_code)
        self.assertEqual(ret['sc_category'], self.type.proxy_sc_category)

    def test_proxy_cost_amount(self):
        cost_amount = 1
        self.type.cost_amount = cost_amount

        ret = self.type.proxy_cost_amount

        self.assertIsInstance(ret, dict)
        self.assertEqual(ret['value'], cost_amount)
        self.assertIn('inherited_value', ret)
        self.assertIn('inherits_from', ret)
        self.assertIn('inherits_from_id', ret)

    def test_proxy_cost_code(self):
        cost_code = 'foo'
        self.type.cost_code = cost_code

        ret = self.type.proxy_cost_code

        self.assertIsInstance(ret, dict)
        self.assertEqual(ret['value'], cost_code)
        self.assertIn('inherited_value', ret)
        self.assertIn('inherits_from', ret)
        self.assertIn('inherits_from_id', ret)

    def test_proxy_sc_category__root_category(self):
        self.assertIsInstance(self.type.sc_category, ScCategory)
        sc_category = self.type.sc_category

        ret = self.type.proxy_sc_category

        self.assertIsInstance(ret, dict)
        self.assertEqual(ret['value'], sc_category.sc_name)
        self.assertIsNone(ret['inherited_value'])
        self.assertIsNone(ret['inherits_from'])
        self.assertIsNone(ret['inherits_from_id'])

    def test_proxy_sc_category__leaf_category(self):
        self.trade.sc_category = None
        self.assertIsNone(self.trade.sc_category)
        self.assertEqual(self.trade.parent, self.type)

        ret = self.trade.proxy_sc_category

        self.assertIsInstance(ret, dict)
        self.assertIsNone(ret['value'])
        self.assertEqual(ret['inherited_value'], self.type.sc_category.sc_name)
        self.assertEqual(ret['inherits_from'], self.type.name)
        self.assertEqual(ret['inherits_from_id'], str(self.type.id))

    def test_to_dict(self):
        d = self.type.to_dict()
        self.assertIsInstance(d, dict)
        self.assertIn('id', d)
        self.assertIn('parent', d)
        self.assertEqual(d['parent'], None)

    def test_to_dict_with_parent(self):
        d = self.child.to_dict()
        self.assertIsInstance(d, dict)
        self.assertIn('id', d)
        self.assertIn('parent', d)
        self.assertEqual(d['parent']['id'], str(self.child.parent.pk))
        self.assertEqual(d['parent']['name'], self.child.parent.name)

    def test_to_simple_dict(self):
        d = self.type.to_simple_dict()

        self.assertEqual(d['id'], str(self.type.id))
        self.assertEqual(d['name'], self.type.name)
        self.assertIsNone(d['parent'])

    def test_to_simple_dict_with_parent(self):
        d = self.child.to_simple_dict()

        self.assertEqual(d['id'], str(self.child.id))
        self.assertEqual(d['name'], self.child.name)
        self.assertEqual(d['parent'], str(self.child.parent.id))

    def test_parents_and_self_as_string(self):
        parent = factory.create_single_category()
        child = factory.create_single_category(parent=parent)
        grand_child = factory.create_single_category(parent=child)
        self.assertIsNone(parent.parent)
        self.assertEqual(child.parent, parent)
        self.assertEqual(grand_child.parent, child)

        ret = grand_child.parents_and_self_as_string()

        self.assertEqual(ret, "{} - {} - {}".format(parent.name, child.name, grand_child.name))

    def test_parents_and_self_as_string__if_has_chilren_only_goes_up_n_gets_parent_strings(self):
        parent = factory.create_single_category(name='a')
        child = factory.create_single_category(name='b', parent=parent)
        grand_child = factory.create_single_category(name='c', parent=child)
        self.assertIsNone(parent.parent)
        self.assertEqual(child.parent, parent)
        self.assertEqual(grand_child.parent, child)

        ret = child.parents_and_self_as_string()

        self.assertEqual(ret, "{} - {}".format(parent.name, child.name))


class CategoryLevelTests(CategorySetupMixin, TestCase):

    def test_set_level__no_parents(self):
        self.assertEqual(self.type._set_level(), 0)

    def test_set_level__one_parent(self):
        self.assertTrue(self.trade.parent)
        self.assertFalse(self.trade.parent.parent)
        self.assertEqual(self.trade._set_level(), 1)

    def test_set_level__two_parent(self):
        self.assertTrue(self.child.parent)
        self.assertTrue(self.child.parent.parent)
        self.assertFalse(self.child.parent.parent.parent)
        self.assertEqual(self.child._set_level(), 2)

    def test_level__type(self):
        self.assertEqual(self.type.level, 0)

    def test_level__trade(self):
        self.assertEqual(self.trade.level, 1)

    def test_level__child(self):
        self.assertEqual(self.child.level, 2)

    def test_add_category_changes_level(self):
        parent = factory.create_single_category()
        child = factory.create_single_category()
        self.assertEqual(parent.level, 0)
        self.assertEqual(child.level, 0)

        parent.children.add(child)

        self.assertEqual(parent.level, 0)
        self.assertEqual(child.level, 0)
        child.save()
        self.assertEqual(child.level, 1)


class ScCategoryManagerTests(TestCase):

    def test_download_sc_trades(self):
        filename = os.path.join(
            os.path.join(settings.MEDIA_ROOT, 'sc'), SC_TRADES_CSV)
        with open(filename, 'w'): pass

        ScCategory.objects.download_sc_trades()

        with open(filename) as f:
            self.assertEqual(sum(1 for line in f), 224,
                             '1 extra than number of records b/c includes column titles')

    def test_import_sc_trades(self):
        self.assertEqual(ScCategory.objects.count(), 0)

        ScCategory.objects.import_sc_trades()

        self.assertEqual(ScCategory.objects.count(), 223)


class ScCategoryTests(TestCase):

    def test_manager(self):
        self.assertIsInstance(ScCategory.objects, ScCategoryManager)
