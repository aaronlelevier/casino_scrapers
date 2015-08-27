import os

from django.test import TestCase
from django.conf import settings

from model_mommy import mommy

from translation.models import Locale, Translation
from translation.tests import factory
from util.create import _generate_chars


class LocaleTests(TestCase):

    def setUp(self):
        factory.create_locales()
        self.locale = Locale.objects.first()

    def test_create_default(self):
        for l in Locale.objects_all.all():
            l.delete(override=True)
        self.assertEqual(Locale.objects_all.count(), 0)

        d = Locale.objects.create_default()
        self.assertIsInstance(d, Locale)
        self.assertEqual(d.locale, settings.LANGUAGE_CODE)

    def test_update_default(self):
        for l in Locale.objects_all.all():
            l.delete(override=True)
        self.assertEqual(Locale.objects_all.count(), 0)

        d = mommy.make(Locale, default=True)
        self.assertIsInstance(d, Locale)
        self.assertTrue(d.default)

    def test_post_save_update_locale(self):
        Locale.objects.create_default()
        self.assertEqual(Locale.objects.filter(default=True).count(), 1)
        # Saving another Locale doesn't violate the single
        # default Locale constraint.
        d = mommy.make(Locale, default=True)
        self.assertEqual(Locale.objects.filter(default=True).count(), 1)
        self.assertTrue(d.default)


class TranslationManagerTests(TestCase):

    def test_translation_dir(self):
        self.assertIn('translation', Translation.objects.translation_dir)

    def test_import_csv(self):
        self.assertEqual(Translation.objects.count(), 0)
        t = Translation.objects.import_csv('en')
        self.assertEqual(Translation.objects.count(), 1)

    def test_export_csv(self):
        mypath = Translation.objects.translation_dir
        t = Translation.objects.import_csv('en')
        os.remove(os.path.join(mypath, '{}-out.csv'.format(t.locale)))
        Translation.objects.export_csv(t.id)
        os.path.isfile(os.path.join(mypath, '{}-out.csv'.format(t.locale)))


class TranslationTests(TestCase):

    def setUp(self):
        factory.create_definitions()
        self.definition = Translation.objects.first()

    def test_add(self):
        k = _generate_chars()
        v = _generate_chars()
        self.definition.values[k] = v
        self.definition.save()
        self.assertEqual(Translation.objects.get(id=self.definition.id).values[k], v)

    def test_update(self):
        k = self.definition.values.keys()[0]
        v = _generate_chars()
        self.definition.values[k] = v
        self.definition.save()
        self.assertEqual(Translation.objects.get(id=self.definition.id).values[k], v)

    def test_delete(self):
        k = self.definition.values.keys()[0]
        self.definition.values.pop(k, None)
        self.definition.save()
        with self.assertRaises(KeyError):
            Translation.objects.get(id=self.definition.id).values[k]
