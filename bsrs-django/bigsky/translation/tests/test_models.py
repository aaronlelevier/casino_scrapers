from mock import patch
import os

from django.test import TestCase
from django.conf import settings

from model_mommy import mommy

from translation.models import Locale, Translation, TranslationManager, TranslationQuerySet
from translation.tests import factory
from utils import ListObject
from utils.create import _generate_chars


class LocaleSetupMixin(object):

    def setUp(self):
        factory.create_locales()
        self.locale = Locale.objects.first()


class LocaleManagerTests(LocaleSetupMixin, TestCase):

    def test_update_default(self):
        for l in Locale.objects_all.all():
            l.delete(override=True)
        self.assertEqual(Locale.objects_all.count(), 0)

        d = mommy.make(Locale, default=True)
        self.assertIsInstance(d, Locale)
        self.assertTrue(d.default)
        self.assertEqual(Locale.objects_all.count(), 1)

    def test_system_default(self):
        for l in Locale.objects_all.all():
            l.delete(override=True)
        self.assertEqual(Locale.objects_all.count(), 0)

        d = Locale.objects.system_default()
        self.assertIsInstance(d, Locale)
        self.assertEqual(d.locale, settings.LANGUAGE_CODE)

    def test_get_or_create_by_i18n_name(self):
        locale_name = 'foo'

        obj, created = Locale.objects.get_or_create_by_i18n_name(locale_name)

        self.assertTrue(created)
        self.assertEqual(obj.locale, locale_name)
        self.assertEqual(obj.name, 'admin.locale.{}'.format(locale_name))

    def test_get_or_create_by_i18n_name__update_name(self):
        # Locale exists, but name needs to be updated
        locale_name = 'foo'
        locale = mommy.make(Locale, name=locale_name, locale=locale_name)
        self.assertEqual(locale.name, locale_name)

        obj, created = Locale.objects.get_or_create_by_i18n_name(locale_name)
        self.assertFalse(created)
        self.assertEqual(obj.locale, locale_name)
        self.assertEqual(obj.name, 'admin.locale.{}'.format(locale_name))

    def test_get_or_create_by_i18n_name__indepomtent_based_on_name(self):
        locale_name = 'foo'
        obj, _ = Locale.objects.get_or_create_by_i18n_name(locale_name)
        init_count = Locale.objects.count()

        obj, _ = Locale.objects.get_or_create_by_i18n_name(locale_name)

        post_count = Locale.objects.count()
        self.assertEqual(post_count, init_count)


class LocaleTests(LocaleSetupMixin, TestCase):

    def test_post_save_update_locale(self):
        self.assertTrue(Locale.objects.all().exists())
        # Saving another Locale doesn't violate the single
        # default Locale constraint.
        d = mommy.make(Locale, default=True)
        self.assertEqual(Locale.objects.filter(default=True).count(), 1)
        self.assertTrue(d.default)


class TranslationManagerTests(TestCase):

    def test_queryset_cls(self):
        self.assertEqual(TranslationManager.queryset_cls, TranslationQuerySet)

    def test_search_multi(self):
        factory.create_translations()
        keyword = 'a'
        seq = Translation.objects.all_distinct_keys()
        raw_ret = ListObject({el for el in seq if keyword in el})

        ret = Translation.objects.search_multi(keyword)

        self.assertEqual(len(ret), len(raw_ret))
        self.assertIsInstance(ret, list)

    def test_get_or_create_by_locale(self):
        locale = mommy.make(Locale)
        first_count = Translation.objects.count()

        ret, _ = Translation.objects.get_or_create(locale=locale)

        second_count = Translation.objects.count()
        self.assertEqual(second_count, first_count+1)
        
        # 2nd pass, no change in count
        ret, _ = Translation.objects.get_or_create(locale=locale)

        third_count = Translation.objects.count()
        self.assertEqual(third_count, second_count)

    def test_translation_dir(self):
        self.assertIn('translation', Translation.objects.translation_dir)

    @patch("translation.models.TranslationManager._write_to_csv")
    def test_gspread_get_all_csv(self, mock_func):
        language = 'French'
        locale = Translation.objects.language_locales[language]

        Translation.objects.gspread_get_csv(language, locale)

        self.assertTrue(mock_func.was_called)

    def test_import_csv(self):
        locale = 'en'
        self.assertEqual(Translation.objects.count(), 0)

        t = Translation.objects.import_csv(locale)

        self.assertEqual(Translation.objects.count(), 1)
        # Locale
        locale = Locale.objects.get(locale=locale)
        self.assertEqual(t.locale, locale)
        self.assertEqual(locale.name, 'admin.locale.{}'.format(locale))

    @patch('translation.models.open')
    def test_export_csv(self, mock_func):
        t = mommy.make(Translation, locale__locale='en')

        Translation.objects.export_csv(t.id)

        mock_func.assert_called_with(
            os.path.join(Translation.objects.translation_dir,
                         '{}-out.csv'.format(t.locale)), 'w', newline='')

    def test_all_distinct_keys(self):
        trans_values = {'abe':'a', 'bob':'b'}
        trans = Translation.objects.create(values=trans_values)
        trans_two_values = {'bob':'b', 'cat':'c'}
        trans_two = Translation.objects.create(values=trans_two_values)

        ret = Translation.objects.all_distinct_keys()

        s = set()
        for t in Translation.objects.all():
            s.update(list(t.values.keys()))
        manual_ret = sorted(s)

        self.assertEqual(ret, manual_ret)


class TranslationTests(TestCase):

    def setUp(self):
        factory.create_translations()
        self.definition = Translation.objects.first()

    def test_manager(self):
        self.assertIsInstance(Translation.objects, TranslationManager)

    def test_add(self):
        k = _generate_chars()
        v = _generate_chars()
        self.definition.values[k] = v
        self.definition.save()
        self.assertEqual(Translation.objects.get(id=self.definition.id).values[k], v)

    def test_update(self):
        k = list(self.definition.values.keys())[0]
        v = _generate_chars()
        self.definition.values[k] = v
        self.definition.save()
        self.assertEqual(Translation.objects.get(id=self.definition.id).values[k], v)

    def test_delete(self):
        k = list(self.definition.values.keys())[0]
        self.definition.values.pop(k, None)
        self.definition.save()
        with self.assertRaises(KeyError):
            Translation.objects.get(id=self.definition.id).values[k]
