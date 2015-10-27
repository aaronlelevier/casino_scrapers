from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.postgres.fields import ArrayField


class MyGenericForeignKey(GenericForeignKey):
    """
    `verbose_name` and `choices` must be defined on the field for the DRF 
    to correctly render the browseable API without throwing errors.
    """

    @property
    def verbose_name(self):
        return "Content Object"

    @property
    def choices(self):
        return []


class UpperCaseCharField(models.CharField):

    def __init__(self, *args, **kwargs):
        super(UpperCaseCharField, self).__init__(*args, **kwargs)

    def pre_save(self, model_instance, add):
        value = getattr(model_instance, self.attname, None)
        if value:
            value = value.upper()
            setattr(model_instance, self.attname, value)
            return value
        else:
            return super(UpperCaseCharField, self).pre_save(model_instance, add)
