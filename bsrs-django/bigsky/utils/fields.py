from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey


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


class InheritedValueDescriptor(object):
    """
    To look up inherited values from a related model that uses the same
    field names, when the main model doesn't have a value for the field.

    :related_model:
        (str) name of the related model to inherit setting from if it
        doesn't exist on the ``obj``
    :field: (str) model field name to look up
    :type: (str) python type name
    """
    def __init__(self, related_model, field, type):
        self.related_model = related_model
        self.field = field
        self.type = type

    def __get__(self, obj, type=None):
        if not getattr(obj, self.field):
            related_model = getattr(obj, self.related_model)
            value = getattr(related_model, self.field)
            return {
                'value': None,
                'type': self.type,
                'inherited_value': value,
                'inherits_from': self.related_model
            }
        else:
            value = getattr(obj, self.field)
            return {
                'value': value,
                'type': self.type
            }
