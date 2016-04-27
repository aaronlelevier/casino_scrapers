from django.db.models import Q
from django.test import TestCase

from model_mommy import mommy

from dtd.models import TreeData, TreeDataManager
from setting.tests.factory import create_general_setting


class TreeDataManagerTests(TestCase):

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
        general_settings = create_general_setting()

        ret = TreeData.objects.get_start()

        self.assertIsInstance(ret, TreeData)
        self.assertEqual(ret.key, general_settings.settings['dt_start_key']['value'])


class TreeDataTests(TestCase):

    def test_manager(self):
        self.assertIsInstance(TreeData.objects, TreeDataManager)

    def test_meta_ordering(self):
        self.assertEqual(TreeData._meta.ordering, ('key',))
