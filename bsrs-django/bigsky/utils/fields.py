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


class InheritedValueField(object):
    """
    Resolves an inherited value. If the main model doesn't have the value,
    then fetch the value from the related model. The field name must be the
    same for this to work.

    :related_model:
        (str) name of the related model to inherit setting from if it
        doesn't exist on the ``obj``. obj is a the primary model instance
    :field: (str) model field name to look up
    :type: (str) python type name
    """
    def __init__(self, related_model, field):
        self.related_model = related_model
        self.field = field

    def __get__(self, obj, type=None):
        related_model = getattr(obj, self.related_model)

        ret = {
            'inherited_value': self._getvalue(related_model),
            'inherits_from': self.related_model,
            'inherits_from_id': str(related_model.id)
        }

        if not getattr(obj, self.field):
            ret['value'] = None
        else:
            ret['value'] = self._getvalue(obj)

        return ret

    def _getvalue(self, object):
        o = getattr(object, self.field)
        if issubclass(o.__class__, models.Model):
            return str(o.id)
        return o
