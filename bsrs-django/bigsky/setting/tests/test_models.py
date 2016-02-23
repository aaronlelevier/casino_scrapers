from django.test import TestCase

from setting.settings import DEFAULT_GENERAL_SETTINGS
from setting.tests.factory import create_general_setting


class SettingModelTests(TestCase):

    def setUp(self):
        self.setting = create_general_setting()

    def test_get_all_class_settings(self):
        self.assertEqual(self.setting.get_all_class_settings(), DEFAULT_GENERAL_SETTINGS)

    def test_get_all_instance_settings(self):
        ret = self.setting.get_all_instance_settings()
        self.assertEqual(ret, self.setting.settings)

    def test_get_all_instance_settings_full(self):
        ret = self.setting.get_all_instance_settings_full()
        self.assertEqual(ret, self.setting.settings)
