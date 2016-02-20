import copy
import re

from rest_framework.exceptions import ValidationError

from django.core.exceptions import ObjectDoesNotExist
from django.utils.translation import ugettext_lazy as _


class UniqueForActiveValidator(object):
    """Validate that the ``value`` being sent over is Unique
    for active instances of the ``model``.

    :model: the model type to check against
    :keys: an array of fields to check for uniqueness
    """

    message = _("A {model} exists with these values: {values}.")

    def __init__(self, model, keys, *args, **kwargs):
        self.model = model
        self.keys = keys

    def __call__(self, kwargs):
        values = {key: kwargs.get(key, None) for key in self.keys}

        if values:
            queryset = self.get_queryset()
            queryset = self.exclude_current_instance(queryset)
            if queryset.filter(**values).exists():
                raise ValidationError(self.message.format(
                    values=values, model=self.model.__name__))

    def get_queryset(self):
        return self.model.objects.all()

    def exclude_current_instance(self, queryset):
        """If an instance is being updated, then do not include
        that instance itself as a uniqueness conflict."""
        if self.instance is not None:
            return queryset.exclude(pk=self.instance.pk)
        return queryset

    def set_context(self, serializer):
        """Determine the existing instance, prior to the validation
        call being made."""
        self.instance = getattr(serializer, 'instance', None)


class SettingsValidator(object):
    """Validate that a Settings are the right type."""

    message = _("Must be a {type}")

    def __init__(self, model):
        self.model = model

    def __call__(self, kwargs):
        try:
            instance = self.model.objects.get(id=kwargs.get('id'))
            default_settings = copy.copy(instance.settings)
        except ObjectDoesNotExist:
            default_settings = self.model.get_all_class_settings()

        errors = {}

        settings = kwargs.get('settings', None)
        if settings:
            for k,v in default_settings.items():
                # import pdb;pdb.set_trace()

                try:
                    new_value = settings[k]
                except KeyError:
                    # Silently pass because, if a 'value' isn't being posted
                    # for the setting, we're going to use the default.
                    pass
                else:
                    type_str = default_settings[k]['type']
                    required_type = self.get_required_type(type_str)

                    if not isinstance(new_value, required_type):
                        errors[k] = self.message.format(type=type_str)
            else:
                if errors:
                    raise ValidationError(errors)

    @staticmethod
    def get_required_type(t):
        if t == 'bool':
            return bool
        elif t == 'str':
            return str
        elif t == 'int':
            return int
        elif t == 'float':
            return float
        elif t == 'list':
            return list


### REGEX VALIDATORS

def regex_check_contains(regex, chars):
    pattern = re.compile(regex)
    match = re.search(pattern, chars)
    if match:
        return True
    else:
        return False


def contains_digit(chars):
    regex = r'\d+'
    return regex_check_contains(regex, chars)


def contains_upper_char(chars):
    regex = r'[A-Z]'
    return regex_check_contains(regex, chars)


def contains_lower_char(chars):
    regex = r'[a-z]'
    return regex_check_contains(regex, chars)


def contains_special_char(chars):
    regex = r'[^\w\s]'
    return regex_check_contains(regex, chars)


def contains_no_whitespaces(chars):
    regex = r'[\s]'
    whitespaces = regex_check_contains(regex, chars)
    return not whitespaces
