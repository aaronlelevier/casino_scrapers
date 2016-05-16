from django.test import TestCase

from setting.settings import DEFAULT_GENERAL_SETTINGS


class GeneralSettingsTests(TestCase):

    def setUp(self):
        self.general = DEFAULT_GENERAL_SETTINGS

    def test_all_values(self):
        self.assertEqual(self.general['company_name'], {'value': "Andy's Pianos", 'type': 'str', 'inherited_from': 'general'})
        self.assertEqual(self.general['welcome_text'], {'value': "Welcome", 'type': 'str', 'inherited_from': 'general'})
        self.assertEqual(self.general['login_grace'], {'value': 1, 'type': 'int', 'inherited_from': 'general'})
        self.assertEqual(self.general['exchange_rates'], {'value': 1.0, 'type': 'float', 'inherited_from': 'general'})
        self.assertEqual(self.general['modules'], {'value': [], 'type': 'list', 'inherited_from': 'general'})
        self.assertEqual(self.general['test_mode'], {'value': False, 'type': 'bool', 'inherited_from': 'general'})
        self.assertEqual(self.general['email'], {'value': 'test@bigskytech.com', 'type': 'email', 'inherited_from': 'general'})
        self.assertEqual(self.general['test_contractor_phone'], {'value': '+18587155000', 'type': 'phone', 'inherited_from': 'general'})
        self.assertEqual(self.general['dt_start_key'], {'value': 'Start', 'type': 'str', 'inherited_from': 'general'})
