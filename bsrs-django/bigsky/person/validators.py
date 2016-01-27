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
