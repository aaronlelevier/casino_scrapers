from django.test import TestCase

from setting.settings import GENERAL_SETTINGS, ROLE_SETTINGS, PERSON_SETTINGS


class SettingsTests(TestCase):

    def test_general(self):
        keys = [
            'company_code',
            'company_name',
            'dashboard_text',
            'login_grace',
            'exchange_rates',
            'modules',
            'test_mode',
            'test_contractor_email',
            'test_contractor_phone',
            'dt_start_key'
        ]

        for k in keys:
            self.assertIn(k, GENERAL_SETTINGS)

    def test_role(self):
        keys = [
            'create_all',
            'dashboard_text'
        ]

        for k in keys:
            self.assertIn(k, ROLE_SETTINGS)

    def test_person(self):
        keys = [
            'accept_assign',
            'accept_notify',
            'password_one_time'
        ]

        for k in keys:
            self.assertIn(k, PERSON_SETTINGS)

    def test_type_not_in_defaults(self):
        settings = [GENERAL_SETTINGS, PERSON_SETTINGS, ROLE_SETTINGS]
        for setting in settings:
            for k,v in setting.items():
                self.assertNotIn('type', v)
