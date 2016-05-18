from django.test import TestCase

from person.tests.factory import create_role
from setting.tests.factory import create_general_setting, create_role_setting


class SettingModelTests(TestCase):

    def setUp(self):
        self.setting = create_general_setting()
        self.role = create_role()
        self.role_setting = create_role_setting(self.role)

    def test_combined_settings__no_override(self):
        ret = self.setting.combined_settings

        self.assertEqual(ret['dashboard_text']['value'], 'Welcome')
        self.assertEqual(ret['dashboard_text']['type'], 'str')

    def test_combined_settings__role_has_overrides(self):
        ret = self.role_setting.combined_settings

        # not overridden
        self.assertEqual(ret['create_all']['value'], True)
        self.assertEqual(ret['create_all']['type'], 'bool')
        # overridden
        self.assertEqual(ret['dashboard_text']['value'], None)
        self.assertEqual(ret['dashboard_text']['type'], 'str')
        self.assertEqual(ret['dashboard_text']['inherits_from'], 'general')
        self.assertEqual(ret['dashboard_text']['inherited_value'], 'Welcome')

    def test_inherits_from_names(self):
        s = set()
        s.update(['general'])
        ret = self.role_setting.inherits_from_names
        self.assertEqual(ret, s)

    def test_inherits_from_map(self):
        ret = self.role_setting.inherits_from_map
        self.assertEqual(len(ret), 1)
        self.assertIsInstance(ret, dict)
        self.assertEqual(ret, {'general': self.setting.settings})
