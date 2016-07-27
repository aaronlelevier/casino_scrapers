import random

from django.conf import settings
from django.db.models import Q
from django.test import TestCase

from accounting.models import Currency
from category.models import Category, CategoryManager, CategoryQuerySet, CategoryStatus
from category.tests import factory
from person.tests.factory import create_single_person
from utils.models import DefaultNameManager
from utils.tests.test_helpers import create_default


class CategorySetupMixin(object):

    def setUp(self):
        factory.create_categories()
        self.type = Category.objects.filter(subcategory_label='Trade').first()
        self.trade = Category.objects.filter(label='Trade').first()
        self.child = Category.objects.filter(subcategory_label='Sub-Issue').first()
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
            Q(label__icontains=keyword)
        )

        ret = Category.objects.search_multi(keyword)

        self.assertEqual(ret.count(), raw_ret.count())


class CategoryTests(CategorySetupMixin, TestCase):

    def test_label__no_parent_no_label_set(self):
        category = Category.objects.create(
            name='foo',
            status=random.choice(self.statuses)
        )

        self.assertIsNone(category.parent)
        self.assertEqual(category.label, settings.TOP_LEVEL_CATEGORY_LABEL)
        self.assertEqual(category.subcategory_label, "")

    def test_label__has_parent_but_no_label_set(self):
        subcategory_label = 'bar'
        parent = Category.objects.create(
            name='foo',
            status=random.choice(self.statuses),
            subcategory_label=subcategory_label
        )
        category = Category.objects.create(
            name='foo',
            status=random.choice(self.statuses),
            parent=parent
        )

        self.assertEqual(category.parent, parent)
        self.assertEqual(category.label, subcategory_label)

    def test_top_level_label__explicit(self):
        label = 'foo'
        subcategory_label = 'bar'
        category = Category.objects.create(
            name='my new category',
            label=label,
            subcategory_label=subcategory_label,
            status=random.choice(self.statuses)
        )

        self.assertIsNone(category.parent)
        self.assertEqual(category.label, label)
        self.assertEqual(category.subcategory_label, subcategory_label)

    def test_label_none_top_level(self):
        self.assertIsNotNone(self.trade.parent)
        self.assertEqual(self.trade.label, self.trade.parent.subcategory_label)

    def test_currency(self):
        self.assertIsInstance(self.trade.cost_currency, Currency)

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
