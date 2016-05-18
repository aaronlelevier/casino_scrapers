from django.test import TestCase

from setting.settings import GENERAL_SETTINGS
from setting.tests.factory import create_general_setting


class SettingModelTests(TestCase):

    def setUp(self):
        self.setting = create_general_setting()

    def test_get_combined_settings_file__override(self):
        k = 'welcome_text'
        override  = {k: {'value': "foo", 'type': 'str', 'inherited_from': 'override'}}

        ret = self.setting.get_class_combined_settings('general', override)

        self.assertEqual(ret['welcome_text']['inherited_value'], 'Welcome')
        self.assertEqual(ret['welcome_text']['value'], 'foo')
        self.assertEqual(ret['welcome_text']['inherited_from'], 'general')

    def test_get_combined_settings_file__append(self):
        k = 'welcome_text'
        override  = {'create_all': {'value': "foo", 'type': 'str', 'inherited_from': 'override'}}

        ret = self.setting.get_class_combined_settings('general', override)

        # not overrode
        self.assertEqual(ret['welcome_text']['inherited_value'], 'Welcome')
        self.assertIsNone(ret['welcome_text']['value'])
        self.assertEqual(ret['welcome_text']['inherited_from'], 'general')
        # appended
        self.assertEqual(ret['create_all']['value'], 'foo')
        self.assertIsNone(ret['create_all']['inherited_value'])
        self.assertEqual(ret['create_all']['inherited_from'], 'override')

    def test_get_all_class_settings(self):
        self.assertEqual(self.setting.get_all_class_settings(), GENERAL_SETTINGS)

    def test_get_all_instance_settings(self):
        ret = self.setting.get_all_instance_settings()
        self.assertEqual(ret, self.setting.settings)

    def test_get_all_instance_settings_full(self):
        ret = self.setting.get_all_instance_settings_full()
        self.assertEqual(ret, self.setting.settings)
