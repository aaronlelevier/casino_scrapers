import os
import csv
import copy

from django.db import models
from django.contrib.postgres.fields import HStoreField
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.encoding import python_2_unicode_compatible

from utils.models import BaseModel, BaseManager, BaseQuerySet


class LocaleManager(BaseManager):

    def system_default(self):
        "Default Locale from Site settings."
        obj, _ = self.get_or_create(locale=settings.LANGUAGE_CODE)
        return obj

    def update_default(self, id):
        """Only 1 default record allowed. Enforce below in the 
        Locale.save() method."""

        queryset = self.exclude(id=id).filter(default=True)
        if not queryset:
            self.system_default()

        self.exclude(id=id).filter(default=True).update(default=False)


@python_2_unicode_compatible
class Locale(BaseModel):
    locale = models.SlugField(help_text="Example values: en, en-US, en-x-Sephora")
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
            'rtl':self.rtl
            }

    def _update_defaults(self):
        self.locale = self.locale.lower()
        if not self.native_name:
            self.native_name = self.name
        if not self.presentation_name:
            self.presentation_name = self.name


@receiver(post_save, sender=Locale)
def update_locale(sender, instance=None, created=False, **kwargs):
    "Post-save hook for maintaing single default Locale."
    if instance.default:
        Locale.objects.update_default(instance.id)


class TranslationManager(BaseManager):
    "CSV Model methods"

    @property
    def translation_dir(self):
        "Directory to hold all Translation documents."
        current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        return os.path.join(current_dir, 'source/translation')


    def import_csv(self, language):
        '''
        # Boiler-plate code for creating a new `Translation` record

        .. code-block:: python

            from translation.models import Translation, Locale
            for model in [Translation, Locale]:
                for m in model.objects_all.all():
                    m.delete(override=True)
            Translation.objects.import_csv('en')
        '''
        with open(os.path.join(self.translation_dir, '{}.csv'.format(language))) as csvfile:
            reader = csv.DictReader(csvfile)
            values = {}
            context = {}
            locale = None
            for i, row in enumerate(reader):
                if row['LOCALE']:
                    locale = row['LOCALE']
                if row['CONTEXT']:
                    context.update({row['KEY']: row['CONTEXT']})
                if row['VALUE']:
                    values.update({row['KEY']: row['VALUE']})
            
            locale, _ = Locale.objects.get_or_create(locale=language, name=language)
            
            ret, _ = Translation.objects.get_or_create(locale=locale, values={})
            ret.values = values
            ret.context = context
            ret.save()
            return ret

    def export_csv(self, id):
        '''
        Test `export_csv` Boiler-plate

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


def translation_file(instance, filename):
    """Determines the file location of Translation CSVs saved 
    within the MEDAI_ROOT directory."""
    return '/'.join(['translations', filename])


@python_2_unicode_compatible
class Translation(BaseModel):
    '''
    :values: contains all translations for the Locale

    `Flatdict Helper library <https://pypi.python.org/pypi/flatdict>`_ 
    may be useful in flattening nested dictionaries for this Model.

    '''
    locale = models.ForeignKey(Locale)
    values = HStoreField()
    context = HStoreField(blank=True, null=True)
    csv = models.FileField(upload_to=translation_file, blank=True, null=True)

    objects = TranslationManager()

    def __str__(self):
        return "{}: {}".format(self.locale, self.id)
