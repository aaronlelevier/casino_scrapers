import csv

from django.db import models
from django.contrib.postgres.fields import HStoreField
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.forms.models import model_to_dict
from django.utils.encoding import python_2_unicode_compatible

from util.models import AbstractName, BaseModel, BaseManager, BaseQuerySet


class LocaleManager(BaseManager):

    def create_default(self):
        "Default Locale from Site settings."
        obj, _ = self.get_or_create(locale=settings.LANGUAGE_CODE, default=True,
            name=settings.LANGUAGE_CODE_NAME)
        return obj

    def update_default(self, id):
        """Only 1 default record allowed. Enforce below in the 
        Locale.save() method."""

        queryset = self.exclude(id=id).filter(default=True)
        if not queryset:
            self.create_default()

        self.exclude(id=id).filter(default=True).update(default=False)


@python_2_unicode_compatible
class Locale(BaseModel):
    locale = models.SlugField(unique=True,
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
        if not self.native_name:
            self.native_name = self.name
        if not self.presentation_name:
            self.presentation_name = self.name
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


@receiver(post_save, sender=Locale)
def update_locale(sender, instance=None, created=False, **kwargs):
    "Post-save hook for maintaing single default Locale."
    if instance.default:
        Locale.objects.update_default(instance.id)


class TranslationManager(BaseManager):
    "CSV Model methods"

    def import_csv(self):
        with open('/Users/alelevier/Downloads/en.csv') as csvfile: # TODO: change to ``self.csv`` to make dynamic
            reader = csv.DictReader(csvfile)
            values = {}
            context = {}
            locale = None

            for i, row in enumerate(reader):
                if i == 0:
                    locale = row['LOCALE']
                if row['CONTEXT']:
                    context.update({row['KEY']: row['CONTEXT']})
                if row['VALUE']:
                    values.update({row['KEY']: row['VALUE']})

        _locale, _ = Locale.objects.get_or_create(locale=locale)

        ret = Translation.objects.create(
            locale = _locale,
            values = values,
            context = context
        )
        return ret

    def export_csv(self, id):
        t = self.get(id=id)
        with open('/Users/alelevier/Desktop/{}.csv'.format(t.locale), 'wb') as csvfile: # TODO: change location of file output...
            writer = csv.writer(csvfile, delimiter=',')
            writer.writerow(['LOCALE', 'KEY', 'VALUE', 'CONTEXT'])
            for k in t.values.keys():
                writer.writerow([t.locale, k, t.values.pop(k, ''), t.context.pop(k,'')])


def translation_file(instance, filename):
    return '/'.join(['translations', filename])


@python_2_unicode_compatible
class Translation(BaseModel):
    '''
    :values: contains all translations for the Locale

    `Flatdict Helper library <https://pypi.python.org/pypi/flatdict>`_ 
    may be useful in flattening nested dictionaries for this Model.

    '''
    locale = models.OneToOneField(Locale)
    values = HStoreField()
    context = HStoreField(blank=True, null=True)
    csv = models.FileField(upload_to=translation_file, blank=True, null=True)

    objects = TranslationManager()

    def __str__(self):
        return "{self.locale}: {self.values}".format(self=self)