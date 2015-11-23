from rest_framework.exceptions import ValidationError

from django.utils.translation import ugettext_lazy as _


class LocationParentChildValidator(object):
    """Parents/Children Locations can't have the same 
    LocationLevel."""

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
