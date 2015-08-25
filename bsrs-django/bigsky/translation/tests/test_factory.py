from django.test import TestCase

from translation.models import Locale, Translation
from translation.tests import factory


class HelperTests(TestCase):

    def test_create_empty_dict(self):
        d = factory.create_empty_dict()
        self.assertEqual(len(d), 50)
        self.assertIsInstance(d, dict)
        self.assertFalse(any(d.values()))

    def test_update_dict_values(self):
        d = factory.create_empty_dict()
        d = factory.update_dict_values(d)
        self.assertIsInstance(d, dict)
        self.assertTrue(all(d.values()))


class LocaleTests(TestCase):

    def setUp(self):
        factory.create_locales()

    def test_create(self):
        self.assertEqual(Locale.objects.count(), 3)


class TranslationTests(TestCase):

    def setUp(self):
        factory.create_definitions()

    def test_create(self):
        self.assertEqual(Translation.objects.count(), 3)