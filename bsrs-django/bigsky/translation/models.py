from django.db import models
from django.contrib.postgres.fields import HStoreField
from django.utils.encoding import python_2_unicode_compatible

from util.models import BaseModel


@python_2_unicode_compatible
class Locale(BaseModel):
    language = models.SlugField(help_text="Example values: en, en-US, en-x-Sephora")

    def __str__(self):
        return self.language


class Definition(BaseModel):
    language = models.ForeignKey(Locale)
    values = HStoreField()

    def __str__(self):
        return "{self.language}: {self.values}".format(self=self)