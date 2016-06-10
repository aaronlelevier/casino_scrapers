from django.test import TestCase

from person.tests.factory import create_single_person
from setting import models as setting_models
from setting.settings import GENERAL_SETTINGS
from setting.tests.factory import (create_general_setting,
    create_role_setting, create_person_setting)


class SettingModelTests(TestCase):

    def setUp(self):
        self.setting = create_general_setting()
        self.person = create_single_person()
        self.role = self.person.role
        self.role_setting = create_role_setting(self.role)
        self.person_setting = create_person_setting(self.person)

    def test_titles(self):
        self.assertEqual(setting_models.SETTING_TITLE_GENERAL, 'admin.setting.name.general')
        self.assertEqual(setting_models.SETTING_TITLE_PERSON, 'admin.setting.name.person')
        self.assertEqual(setting_models.SETTING_TITLE_ROLE, 'admin.setting.name.role')

    def test_combined_settings__no_override(self):
        ret = self.setting.combined_settings()

        self.assertEqual(ret['dashboard_text']['value'], 'Welcome')

    def test_combined_settings__role_has_overrides(self):
        ret = self.role_setting.combined_settings()

        # not overridden
        self.assertEqual(ret['create_all']['value'], True)
        # overridden
        self.assertEqual(ret['dashboard_text']['value'], None)
        self.assertEqual(ret['dashboard_text']['inherits_from'], 'general')
        self.assertEqual(ret['dashboard_text']['inherits_from_id'], str(self.setting.id))
        self.assertEqual(ret['dashboard_text']['inherited_value'], 'Welcome')

    def test_combined_settings__person_inherits_from_role(self):
        # Person's initial inherited value
        person = create_single_person()
        person_setting = create_person_setting(person)
        role = person.role
        role_setting = create_role_setting(role)
        self.assertEqual(role_setting.settings['accept_assign']['value'], False)

        ret = person_setting.combined_settings()

        self.assertEqual(ret['accept_assign']['value'], None)
        self.assertEqual(ret['accept_assign']['inherits_from'], 'role')
        self.assertEqual(ret['accept_assign']['inherited_value'], False)

        # modify Person's Setting
        self.assertEqual(role_setting.settings['accept_assign']['value'], False)
        role_setting.settings['accept_assign']['value'] = True
        role_setting.save()

        ret = person_setting.combined_settings()

        # not overridden
        self.assertEqual(ret['password_one_time']['value'], False)
        # overridden
        self.assertEqual(ret['accept_assign']['value'], None)
        self.assertEqual(ret['accept_assign']['inherits_from'], 'role')
        self.assertEqual(ret['accept_assign']['inherited_value'], True)

    def test_get_inherits_from_names(self):
        s = set()
        s.update(['general'])
        ret = self.role_setting.get_inherits_from_names()
        self.assertEqual(ret, s)

    def test_get_inherits_from_map(self):
        ret = self.role_setting.get_inherits_from_map()
        self.assertIsInstance(ret, dict)
        self.assertEqual(len(ret), 1)
        self.assertIsInstance(ret['general'], tuple)
        self.assertEqual(len(ret['general']), 2)
        self.assertEqual(ret['general'][0], str(self.setting.id))
        self.assertEqual(ret['general'][1], self.setting.settings)

    def test_nonverbose_combined_settings(self):
        ret = self.setting.nonverbose_combined_settings()

        self.assertEqual(sorted(ret.keys()), sorted(self.setting.combined_settings().keys()))

        for k,v in GENERAL_SETTINGS.items():
            self.assertEqual(ret[k], GENERAL_SETTINGS[k]['value'])
