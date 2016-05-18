from django.test import TestCase

from setting.models import Setting
from setting.settings import GENERAL_SETTINGS, ROLE_SETTINGS
from setting.tests import factory
from person.tests.factory import create_single_person


class FactoryTests(TestCase):

    def setUp(self):
        self.person = create_single_person()
        self.role = self.person.role

    def test_create_general_setting(self):
        name = 'general'

        ret = factory.create_general_setting()

        self.assertIsInstance(ret, Setting)
        self.assertEqual(name, ret.name)
        self.assertEqual(ret.settings, GENERAL_SETTINGS)

    def test_create_role_setting(self):
        self.assertIsNone(self.role.settings)

        ret = factory.create_role_setting(self.role)

        self.assertIsInstance(ret, Setting)
        self.assertEqual(ret.settings, ROLE_SETTINGS)
        self.assertEqual(self.role.settings.settings, ret.settings)
