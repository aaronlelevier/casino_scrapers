import re

from django.shortcuts import get_object_or_404
from django.utils.translation import ugettext_lazy as _
from django.core.exceptions import ValidationError as DjangoValidationError

from rest_framework.exceptions import ValidationError

from location.models import Location
from person.models import Role


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


class LocationValidator(object):
    '''
    Validate that at Person's Location is allowed based upon the 
    Role's LocationLevel.
    '''
    message = _("The {locations} location level must equal the Role's LocationLevel.")

    def __init__(self, role, locations, message=None):
        self.queryset = Role.objects.all()
        self.role = role
        self.locations = locations
        self.message = message or self.message

    def __call__(self, kwargs):
        role = kwargs.get('role', None)
        locations = kwargs.get('locations', None)
        locations = Location.objects.filter(id__in=[l.id for l in locations])

        queryset = self.queryset
        queryset = self.filter_queryset(queryset)

        invalid_locations = locations.exclude(
            location_level=role.location_level)
        if invalid_locations:
            raise ValidationError(self.message.format(
                locations=' ,'.join([l.name for l in invalid_locations])))

    def set_context(self, serializer):
        """
        This hook is called by the serializer instance,
        prior to the validation call being made.
        """
        # Determine the existing instance, if this is an update operation.
        self.instance = getattr(serializer, 'instance', None)


    def filter_queryset(self, queryset):
        "Validate Role.id of the Person."
        try: 
            return queryset.get(id=self.instance.role.id)
        except Role.DoesNotExist:
            raise ValidationError("Role: {} does not exist.".format(
                self.instance.role.id))
