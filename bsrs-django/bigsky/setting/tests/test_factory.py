from django.test import TestCase

from setting.models import (Setting, SETTING_TITLE_GENERAL,
    SETTING_TITLE_ROLE, SETTING_TITLE_PERSON)
from setting.settings import GENERAL_SETTINGS, ROLE_SETTINGS, PERSON_SETTINGS
from setting.tests import factory
from person.tests.factory import create_single_person


class FactoryTests(TestCase):

    def setUp(self):
        self.person = create_single_person()
        self.role = self.person.role

    def test_create_general_setting(self):
        name = 'general'

        ret = Setting.objects.get(name='general')

        self.assertIsInstance(ret, Setting)
        self.assertEqual(str(ret.id)[-3:], '001')
        self.assertEqual(ret.name, name)
        self.assertEqual(ret.title, SETTING_TITLE_GENERAL)
        self.assertEqual(ret.settings, GENERAL_SETTINGS)

        # get-or-create: so call a 2nd time, returns a fresh instance
        # so don't get leaky state from 'dicts' across tests
        ret_two = factory.create_general_setting()
        self.assertEqual(ret_two.name, ret.name)

    def test_create_general_setting__takes_a_name_arg(self):
        name = 'foo'

        ret = factory.create_general_setting(name)

        self.assertIsInstance(ret, Setting)
        self.assertEqual(ret.name, name)

    def test_create_role_setting(self):
        ret = factory.create_role_setting(self.role)

        self.assertIsInstance(ret, Setting)
        self.assertEqual(ret, self.role.settings)
        self.assertEqual(ret.name, 'role')
        self.assertEqual(ret.title, SETTING_TITLE_ROLE)
        self.assertEqual(ret.related_id, self.role.id)
        self.assertEqual(ret.settings, ROLE_SETTINGS)
        self.assertEqual(self.role.settings.settings, ret.settings)

    def test_create_person_setting(self):
        ret = factory.create_person_setting(self.person)

        self.assertIsInstance(ret, Setting)
        self.assertEqual(ret, self.person.settings)
        self.assertEqual(ret.name, 'person')
        self.assertEqual(ret.title, SETTING_TITLE_PERSON)
        self.assertEqual(ret.related_id, self.person.id)
        self.assertEqual(ret.settings, PERSON_SETTINGS)
        self.assertEqual(self.person.settings.settings, ret.settings)

    def test_remove_prior_settings(self):
        for s in Setting.objects.all():
            s.delete(override=True)
        self.assertEqual(Setting.objects.count(), 0)

        # remove setting with "name" if exists
        factory.create_general_setting()
        self.assertEqual(Setting.objects.count(), 1)
        factory.remove_prior_settings(name='general')
        self.assertEqual(Setting.objects.count(), 0)

        # no affect if none
        factory.remove_prior_settings(name='general')
        self.assertEqual(Setting.objects.count(), 0)
