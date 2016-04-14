import re

from rest_framework.exceptions import ValidationError

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

    message = _("{value} must be type {type}")

    def __init__(self, model):
        self.model = model

    def __call__(self, kwargs):
        default_settings = self.model.cls_get_all_class_settings()

        errors = {}

        settings = kwargs.get('settings', None)
        if settings:
            for k,v in default_settings.items():

                try:
                    new_value = settings[k]
                except KeyError:
                    # Silently pass because, if a 'value' isn't being posted
                    # for the setting, we're going to use the default.
                    pass
                else:
                    value = self.get_value(new_value)
                    type_str = default_settings[k]['type']

                    error = self.validate_new_value(value, new_value, type_str)
                    if error:
                        errors[k] = error
            else:
                if errors:
                    raise ValidationError(errors)

    @staticmethod
    def get_value(v):
        try:
            return v['value']
        except TypeError:
            return v

    def validate_new_value(self, value, new_value, type_str):
        if type_str == 'email':
            return self.validate_email(value)
        elif type_str == 'phone':
            return self.validate_phone(value)
        else:
            required_type = self.get_required_type(type_str)
            if not isinstance(value, required_type):
                return self.message.format(value=value, type=type_str)

    def validate_email(self, email):
        if not valid_email(email):
            return _('{} is not a valid email'.format(email))

    def validate_phone(self, phone):
        if not valid_phone(phone):
            return _('{} is not a valid phone'.format(phone))

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

def valid_email(email):
    if email:
        pattern = re.compile(r'[^@]+@[^@]+\.[^@]+')
        return re.match(pattern, email)


def valid_phone(phone):
    if phone:
        pattern = re.compile(r'(?:\+1){0,1}(\d{10})')
        return re.match(pattern, phone)


def regex_check_contains(regex, chars):
    pattern = re.compile(regex)
    return re.search(pattern, chars)


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
