import copy
import re

from django.utils.translation import ugettext_lazy as _

from rest_framework.exceptions import ValidationError


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

    types = {
        "company_code": "str",
        "company_name": "str",
        "dashboard_text": "str",
        "login_grace": "int",
        "exchange_rates": "float",
        "modules": "list",
        "test_mode": "bool",
        "test_contractor_email": "email",
        "test_contractor_phone": "phone",
        "dt_start_key": "str",
        "create_all": "bool",
        "accept_assign": "bool",
        "accept_notify": "bool",
        "password_one_time": "bool"
    }

    def set_context(self, serializer_field):
        """
        This hook is called by the serializer instance,
        prior to the validation call being made.
        """
        self.init_settings = copy.copy(serializer_field.instance.settings)

    def __call__(self, kwargs):
        errors = {}
        settings = copy.copy(kwargs.get('settings', None))
        if settings:
            for k,v in self.init_settings.items():
                try:
                    raw_value = settings[k]
                    value = self.strip_value(raw_value)
                except KeyError:
                    # Silently pass because, if a 'value' isn't being posted
                    # for the setting, we're going to use the default.
                    pass
                else:
                    type_str = self.types[k]
                    related_model = self.init_settings[k].get('related_model', None)

                    error = self.validate_new_value(value, type_str=type_str,
                                                    related_model=related_model)
                    if error:
                        errors[k] = error
            else:
                if errors:
                    raise ValidationError(errors)

    @staticmethod
    def strip_value(value):
        try:
            return value['value']
        except TypeError:
            return value

    def validate_new_value(self, value, **kwargs):
        type_str = kwargs.get('type_str')

        if type_str == 'email':
            return self.validate_email(value)
        elif type_str == 'phone':
            return self.validate_phone(value)
        elif type_str == 'float':
            return self.validate_float(value)
        else:
            required_type = self.get_required_type(type_str)
            if not isinstance(value, required_type):
                return self.message.format(value=value, type=type_str)

    def validate_float(self, value):
        try:
            value = float(value)
        except ValueError:
            return self.message.format(value=value, type='float')

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
        return get_re_match(pattern, email)


def valid_phone(phone):
    if phone:
        pattern = re.compile(r'(?:\+1){0,1}(\d{10})')
        return get_re_match(pattern, phone)


def get_re_match(pattern, string):
    try:
        return re.match(pattern, string)
    except TypeError:
        pass


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
