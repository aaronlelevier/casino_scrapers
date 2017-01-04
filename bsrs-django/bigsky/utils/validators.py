import copy
import re
import uuid

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


class UniqueByTenantValidator(object):

    def __init__(self, model_cls, field):
        """
        :param model_cls: Model class to be validated against
        :param field:
            String name of field to validate uniqueness per Tenant
        """
        self.model_cls = model_cls
        self.field = field

    def __call__(self, data):
        field_value = data.get(self.field, None)
        tenant = data.get('tenant', None)
        kwargs = {
            self.field: field_value,
            'tenant': tenant
        }

        if self.instance:
            tenant = self.instance.tenant
            kwargs['tenant'] = tenant
            exists = self.model_cls.objects.filter(**kwargs).exclude(id=self.instance.id).exists()
        else:
            exists = self.model_cls.objects.filter(**kwargs).exists()

        if exists:
            raise ValidationError("{}: '{}' already exists for Tenant: '{}'"
                                  .format(self.field, field_value, tenant.id))

    def set_context(self, serializer=None):
        """Determine the existing instance, prior to the validation
        call being made."""
        self.instance = getattr(serializer, 'instance', None)


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
