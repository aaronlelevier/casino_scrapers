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

    :field:
        type: String
        expl: instance's field name to check for value
    :lookups:
        type: Array of tuples: (inherited-model-name, inherited-field-name)
        expl: way to lookup if value doesn't exist on the instance
    """
    def __init__(self, field, lookups):
        self.field = field
        self.lookups = lookups

    def __get__(self, obj, type=None):
        inherited_model_str = self.lookups[0][0]
        inherited_model_field = self.lookups[0][1]
        inherited_model = self._get_inherited_model(obj, inherited_model_str)

        ret = {
            'inherits_from': inherited_model_str,
            'inherits_from_id': str(inherited_model.id)
        }

        if getattr(obj, self.field):
            ret['value'] = self._getvalue(obj, self.field)

        current_model = obj
        for lookup in self.lookups:
            inherited_model_str = lookup[0]
            inherited_model_field = lookup[1]
            inherited_model = self._get_inherited_model(current_model, inherited_model_str)

            inherited_value = self._getvalue(inherited_model, inherited_model_field)

            if inherited_value is not None:
                ret['inherited_value'] = inherited_value
                continue

            current_model = inherited_model

        return ret

    def _getvalue(self, object, field):
        o = getattr(object, field)
        if issubclass(o.__class__, models.Model):
            return str(o.id)
        return o

    def _get_inherited_model(self, object, model_str):
        return getattr(object, model_str)
