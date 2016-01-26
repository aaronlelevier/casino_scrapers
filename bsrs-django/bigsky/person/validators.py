from django.utils.translation import ugettext_lazy as _

from rest_framework.exceptions import APIException, ValidationError

from location.models import Location
from person.models import Role
from person.settings import DEFAULT_ROLE_SETTINGS


class RoleLocationValidator(object):
    """Validate if the Locations can be assigned based upon the 
    Role's LocationLevel."""

    message = _(
        "The {locations} LocationLevel must equal the Role's "
        "LocationLevel: {role_location_level}.")

    def __init__(self, *args, **kwargs):
        self.queryset = Role.objects.all()

    def __call__(self, kwargs):
        role = kwargs.get('role', None)
        locations = kwargs.get('locations', None)
        locations = Location.objects.filter(id__in=[l.id for l in locations])

        invalid_locations = locations.exclude(
            location_level=role.location_level)
        if invalid_locations:
            raise ValidationError(self.message.format(
                locations=' ,'.join([l.name for l in invalid_locations]),
                role_location_level=role.location_level))

    def set_context(self, serializer):
        """Determine the existing instance, prior to the validation 
        call being made."""
        self.instance = getattr(serializer, 'instance', None)


class RoleCategoryValidator(object):
    """A Role's related Categories can on be top-level Categories."""

    message = _("Role can only have top-level related categories.")

    def __call__(self, kwargs):
        categories = kwargs.get('categories', None)
        if categories:
            for category in categories:
                if category.parent:
                    raise ValidationError(self.message)


class RoleSettingsValidator(object):
    """Validate that a Role's 'settings' are the right type."""

    message = _("Must be a {type}")

    def __call__(self, kwargs):
        default_settings = DEFAULT_ROLE_SETTINGS
        errors = {}

        settings = kwargs.get('settings', None)
        if settings:
            for k,v in default_settings.items():
                try:
                    new_value = settings[k]['value']
                except KeyError:
                    # Silently pass b/c if a 'value' isn't being posted for
                    # a Role setting, we're going to use the default.
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
