from django.db.models import Q
from django.test import TestCase

from model_mommy import mommy

from dtd.models import TreeData, TreeDataManager, TreeDataQuerySet, DTD_START_KEY
from dtd.tests.factory import create_tree_data, create_dtd_fixture_data


class TreeDataManagerTests(TestCase):

    def setUp(self):
        create_dtd_fixture_data()

    def test_search_multi(self):
        keyword = 'a'
        mommy.make(TreeData, key=keyword)
        mommy.make(TreeData, key='b')
        mommy.make(TreeData, description=keyword)
        raw_ret = TreeData.objects.filter(
            Q(key__icontains=keyword) | \
            Q(description__icontains=keyword)
        )

        ret = TreeData.objects.search_multi(keyword)

        self.assertEqual(len(ret), len(raw_ret))

    def test_queryset_cls(self):
        self.assertEqual(TreeDataManager.queryset_cls, TreeDataQuerySet)

    def test_get_start(self):
        ret = TreeData.objects.get_start()

        self.assertIsInstance(ret, TreeData)
        self.assertEqual(str(ret.key), DTD_START_KEY)


class TreeDataTests(TestCase):

    def setUp(self):
        create_tree_data()

    def test_export_fields(self):
        export_fields = ['id', 'key', 'description']

        self.assertEqual(TreeData.EXPORT_FIELDS, export_fields)

    def test_filter_export_data__queryset_matches_export_fields(self):
        tree_data = TreeData.objects.filter_export_data().first()
        for f in TreeData.EXPORT_FIELDS:
            self.assertTrue(hasattr(tree_data, f))

    def test_manager(self):
        self.assertIsInstance(TreeData.objects, TreeDataManager)

    def test_meta_ordering(self):
        self.assertEqual(TreeData._meta.ordering, ('key',))
