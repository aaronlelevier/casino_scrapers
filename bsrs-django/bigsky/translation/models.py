from django.db import models
from django.contrib.postgres.fields import HStoreField
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
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
    rtl = models.BooleanField(blank=True, default=False)

    objects = LocaleManager()

    def __str__(self):
        return self.locale


@receiver(post_save, sender=Locale)
def update_locale(sender, instance=None, created=False, **kwargs):
    "Post-save hook for maintaing single default Locale."
    if instance.default:
        Locale.objects.update_default(instance.id)


@python_2_unicode_compatible
class Translation(BaseModel):
    '''
    :values: contains all translations for the Locale

    `Flatdict Helper library <https://pypi.python.org/pypi/flatdict>`_ 
    may be useful in flattening nested dictionaries for this Model.

    '''
    locale = models.OneToOneField(Locale)
    values = HStoreField()

    def __str__(self):
        return "{self.language}: {self.values}".format(self=self)