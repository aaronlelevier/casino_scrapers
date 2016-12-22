import csv
import copy
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import os

from django.db import models
from django.contrib.auth.models import ContentType
from django.contrib.postgres.fields import HStoreField
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from utils.helpers import get_model_class
from utils.models import BaseModel, BaseManager, BaseQuerySet


class LocaleManager(BaseManager):

    def system_default(self):
        "Default Locale from Site settings."
        obj, _ = self.get_or_create(locale=settings.LANGUAGE_CODE)
        return obj

    def update_non_default(self, id):
        """
        Only 1 default record allowed. Enforce below in the 
        Locale.save() method.

        Locale instance passed to this method must be ``default=True``
        """
        self.exclude(id=id).filter(default=True).update(default=False)

    def get_or_create_by_i18n_name(self, locale_name):
        locale, created = self.get_or_create(locale=locale_name.lower())
        locale.name = 'admin.locale.{}'.format(locale_name)
        locale.save()
        return locale, created


class Locale(BaseModel):
    locale = models.CharField(max_length=50, unique=True,
        help_text="Example values: en, en-US, en-x-Sephora")
    default = models.BooleanField(blank=True, default=False)
    name = models.CharField(max_length=50, 
        help_text="Human readable name in forms. i.e. 'English'")
    native_name = models.CharField(max_length=50, blank=True, null=True)
    presentation_name = models.CharField(max_length=50, blank=True, null=True)
    rtl = models.BooleanField(blank=True, default=False)

    objects = LocaleManager()

    def __str__(self):
        return self.locale

    def save(self, *args, **kwargs):
        self._update_defaults()
        return super(Locale, self).save(*args, **kwargs)

    def to_dict(self):
        return {
            'id':str(self.id),
            'locale':self.locale,
            'name':self.name,
            'native_name':self.native_name,
            'presentation_name':self.presentation_name,
            'rtl':self.rtl,
            'default': True if self.native_name == 'en' else False
            }

    def _update_defaults(self):
        self.locale = self.locale.lower()
        if not self.native_name:
            self.native_name = self.name
        if not self.presentation_name:
            self.presentation_name = self.name

    @property
    def translation_(self):
        Translation = get_model_class("translation")
        return Translation.objects.get(locale=self)


@receiver(post_save, sender=Locale)
def update_locale(sender, instance=None, created=False, **kwargs):
    "Post-save hook for maintaing single default Locale."
    if instance.default:
        Locale.objects.update_non_default(instance.id)


class TranslationQuerySet(BaseQuerySet):

    def all_distinct_keys(self):
        s = set()
        for t in self.all():
            s.update(list(t.values.keys()))
        return sorted(s)

    def search_multi(self, keyword):
        seq = self.all_distinct_keys()
        return sorted([x for x in seq if keyword in x])


class TranslationManager(BaseManager):
    "CSV Model methods"

    queryset_cls = TranslationQuerySet

    def search_multi(self, keyword):
        return self.get_queryset().search_multi(keyword)

    @property
    def translation_dir(self):
        "Directory to hold all Translation documents."
        current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        return os.path.join(settings.MEDIA_ROOT, 'translation')

    def gspread_get_all_csv(self):
        for language, locale in self.language_locales.items():
            self.gspread_get_csv(language, locale)

    def gspread_get_csv(self, language, locale):
        """
        Connects to Google Sheets API and retrieves worksheets for i18n.
        """
        scope = ['https://spreadsheets.google.com/feeds']
        credentials = ServiceAccountCredentials.from_json_keyfile_name(os.path.join(self.translation_dir, 'i18n.json'), scope)
        gc = gspread.authorize(credentials)
        wks = gc.open(language).sheet1
        self._write_to_csv(wks, language, locale)

    def _write_to_csv(self, wks, language, locale):
        """
        Writes retrieved worksheets from Google sheets to CSVs.
        """
        with open(os.path.join(self.translation_dir, '{}.csv'.format(locale)), 'w', newline='') as csvfile:
            writer = csv.writer(csvfile, delimiter=',')
            for row in wks.get_all_values():
                writer.writerow(row)

    @property
    def language_locales(self):
        """
        The values of this `dict` should be i18b strings b/c are needed in UI dropdown as i18n strings.
        """
        return {
            'Chinese (Traditional)': 'zh-cn',
            'English (Master)': 'en',
            'French': 'fr',
            'Japanese': 'ja',
            'Spanish': 'es'
        }

    def import_all_csv(self):
        for language, locale in self.language_locales.items():
            self.import_csv(locale)

    def import_csv(self, locale_name):
        """
        Reads CSVs and writes i18n strings to database using
        the Translation models.
        """
        with open(os.path.join(self.translation_dir, '{}.csv'.format(locale_name))) as csvfile:
            reader = csv.DictReader(csvfile)
            values = {}
            context = {}
            for i, row in enumerate(reader):
                if row['VALUE']:
                    values.update({row['KEY']: row['VALUE']})
                if row['CONTEXT']:
                    context.update({row['KEY']: row['CONTEXT']})
            
            locale, _ = Locale.objects.get_or_create_by_i18n_name(locale_name)

            ret, _ = Translation.objects.get_or_create(locale=locale)
            ret.values = values
            ret.context = context
            ret.save()
            return ret

    def export_csv(self, id):
        '''
        # Boiler-plate code for exporting a `Translation` record

        .. code-block:: python

            from translation.models import Translation, Locale
            a = Translation.objects.first()
            Translation.objects.export_csv(a.id)
        '''
        t = self.get(id=id)
        with open(os.path.join(self.translation_dir, '{}-out.csv'.format(t.locale)), 'w', newline='') as csvfile:
            writer = csv.writer(csvfile, delimiter=',')
            writer.writerow([
                'LOCALE',
                'KEY',
                'VALUE',
                'CONTEXT'
            ])

            # copy the values to write to 'csv' here, or else will 
            # raise a runtime error in python3
            values = copy.copy(t.values)
            context = copy.copy(t.context)
            for k in t.values.keys():
                writer.writerow([
                    str(t.locale),
                    str(k),
                    str(values.pop(k, '')),
                    str(context.pop(k,''))
                ])

    def all_distinct_keys(self):
        """
        Return all distinct Translation keys accross all translations 
        in a sorted list. For use with the Translation List API Endpoint.
        """
        return self.get_queryset().all_distinct_keys()


def translation_file(instance, filename):
    """Determines the file location of Translation CSVs saved 
    within the MEDAI_ROOT directory."""
    return '/'.join(['translations', filename])


class Translation(BaseModel):
    '''
    :values: contains all translations for the Locale

    `Flatdict Helper library <https://pypi.python.org/pypi/flatdict>`_ 
    may be useful in flattening nested dictionaries for this Model.

    :OneToOne Locale create signal:
        doesn't exist because not enough information available from the 
        Translation to create the Locale.  Locale should ideally be 
        created first.
    '''
    locale = models.OneToOneField(Locale, blank=True, null=True)
    values = HStoreField(default={}, blank=True)
    context = HStoreField(default={}, blank=True)
    csv = models.FileField(upload_to=translation_file, blank=True, null=True)

    objects = TranslationManager()

    def __str__(self):
        return "{}: {}".format(self.locale, self.id)

    @classmethod
    def resolve_i18n_value(cls, values, obj, field):
        """
        :param values: Translation instance's i18n values
        :param obj: Model instance
        :param field: String name of Model instance's property
        """
        try:
            return values[getattr(obj, field)]
        except AttributeError:
            # 'field' isn't a valid model field
            return ''
        except KeyError:
            # no i18n key exists, so just return raw value
            return getattr(obj, field)

    def get_value(self, key):
        """
        Gracefully handle i18n strings that don't have a translation.

        :param key: i18n key to look up
        """
        try:
            return self.values[key]
        except KeyError:
            return ''
