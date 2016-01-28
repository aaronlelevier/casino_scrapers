from django.test import TestCase

from generic.models import Attachment, Setting
from generic.settings import DEFAULT_GENERAL_SETTINGS
from generic.tests import factory
from person.tests.factory import create_single_person
from ticket.tests.factory import create_ticket


class FactoryTests(TestCase):

    def setUp(self):
        self.person = create_single_person()

    def test_create_general_setting(self):
        name = 'general'

        ret = factory.create_general_setting()

        self.assertIsInstance(ret, Setting)
        self.assertEqual(name, ret.name)
        self.assertEqual(DEFAULT_GENERAL_SETTINGS, ret.settings)
