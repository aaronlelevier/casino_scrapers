import re

from rest_framework.exceptions import ValidationError

from django.utils.translation import ugettext_lazy as _
from django.core.exceptions import ValidationError as DjangoValidationError


def validate_phone(phone):
    '''Return: valid Phone Number

    i.e. '+17025101234' else raise Form Error.
    '''
    error_messages = {
        'invalid_ph':'Please enter a 10-digit phone number',
    }
    try:
        re_phone = re.search(r'^\d+$', phone).group()
    except AttributeError:
        raise DjangoValidationError(error_messages['invalid_ph'])
    else:
        return re_phone


class UniqueForActiveValidator(object):
    """Validate that the ``value`` being sent over is Unique 
    for active instances of the ``model``.

    :model: the model type to check against
    :key: the field to check for uniqueness
    """

    message = _("{key}:{value} is not unique for {model}.")

    def __init__(self, model, key, *args, **kwargs):
        self.model = model
        self.key = key

    def __call__(self, kwargs):
        value = kwargs.get(self.key, None)
        if value:
            queryset = self.get_queryset()
            queryset = self.exclude_current_instance(queryset)
            if queryset.filter(**{self.key:value}).exists():
                raise ValidationError(self.message.format(
                    key=self.key, value=value, model=self.model.__name__))

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


class LocationParentChildValidator(object):
    """Parents/Children can't have the same LocationLevel as 
    the Location."""

    message = _("The {key}'s LocationLevels: {values} can't be the "
                "same as the Location's LocationLevel: {location_level}.")

    def __init__(self, location_level, key, *args, **kwargs):
        self.location_level = location_level
        self.key = key

    def __call__(self, kwargs):
        """
        :values: can either be the children or parents array
        :location_level: the location_level FK of the Location
        """
        values = kwargs.get(self.key, None)
        location_level = kwargs.get(self.location_level, None)
        try:
            for v in values:
                if location_level == v.location_level:
                    raise ValidationError(self.message.format(
                        key=self.key, values=v.location_level,
                        location_level=location_level))
        except TypeError:
            # if "values" is None it will raise a TypeError here 
            # b/c we can't iterate over None
            pass