from django.test import TestCase

from translation.models import Locale, Translation
from translation.tests import factory


class FactoryTests(TestCase):

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

    def test_create_locales(self):
        factory.create_locales()
        self.assertEqual(Locale.objects.count(), 4)

    def test_create_locale(self):
        name = 'bob'
        locale = factory.create_locale(name)
        self.assertIsInstance(locale, Locale)
        self.assertEqual(locale.name, name)
        self.assertEqual(locale.locale, name)

    def test_create_translations(self):
        factory.create_translations()
        self.assertEqual(Translation.objects.count(), 4)
