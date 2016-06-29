from django.db.models import Q
from django.test import TestCase

from model_mommy import mommy

from dtd.models import TreeData, TreeDataManager, DTD_START_ID
from dtd.tests.factory import create_dtd_fixture_data


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

    def test_get_start(self):
        ret = TreeData.objects.get_start()

        self.assertIsInstance(ret, TreeData)
        self.assertEqual(str(ret.id), DTD_START_ID)


class TreeDataTests(TestCase):

    def test_manager(self):
        self.assertIsInstance(TreeData.objects, TreeDataManager)

    def test_meta_ordering(self):
        self.assertEqual(TreeData._meta.ordering, ('key',))
