from django.conf import settings
from django.contrib.auth.models import ContentType

from rest_framework.exceptions import ValidationError

from routing.models import Assignment, AvailableFilter


def get_and_validate_available_filter(id):
    try:
        return AvailableFilter.objects.get(id=id)
    except AvailableFilter.DoesNotExist:
        raise ValidationError("{} is not an AvailableFilter ID".format(id))


class ProfileFilterFieldValidator(object):
    """Validate that the Model class returned by the 'context' has
    the 'field' and that the 'field' has valid 'criteria'."""

    def __call__(self, data):
        self.id = data.get('id', None)
        self.criteria = data.get('criteria', [])

        app_label, model = settings.DEFAULT_PROFILE_FILTER_CONTEXT.split('.')
        content_type = ContentType.objects.get(app_label=app_label, model=model)

        klass = content_type.model_class()
        self.is_valid_field_filter(klass)

    def is_valid_field_filter(self, klass):
        af = get_and_validate_available_filter(self.id)
        rel_klass = klass._meta.get_field(af.field).rel.to
        try:
            if not rel_klass.objects.filter(id__in=self.criteria).exists():
                raise ValidationError("'{}' is not a valid id for '{}'"
                                      .format(self.criteria, rel_klass.__name__))
        except ValueError:
            # raised if a NULL value or non-list type is passed to the try block
            raise ValidationError("'{}' not valid. Must be a list of UUIDs".format(self.criteria))


class AvailableFilterValidator(object):
    """Each AvailableFilter can only be used 1x. Get the AF from the 'id'
    attr for an Assignment's related ProfileFilters in order to check it."""

    def __call__(self, data):
        filters = data.get('filters', [])

        unique_keys = set()
        dupe_keys = []
        for f in filters:
            af = get_and_validate_available_filter(f['id'])
            field = af.field

            addit_model_id = ''
            if 'location_level' in f.get('lookups', []):
                addit_model_id = "-location_level-"+f['lookups']['location_level']

            key = "{}{}".format(field, addit_model_id)

            if key in unique_keys:
                dupe_keys.append(key)

            unique_keys.update([key])

        if dupe_keys:
            raise ValidationError("Duplicate filter(s): {}".format(' ,'.join(dupe_keys)))


class UniqueByTenantValidator(object):

    def __init__(self, field):
        self.field = field

    def __call__(self, data):
        field_value = data.get(self.field, None)
        tenant = data.get('tenant', None)
        kwargs = {
            self.field: field_value,
            'tenant': tenant
        }

        if self.instance:
            exists = Assignment.objects.filter(**kwargs).exclude(id=self.instance.id).exists()
        else:
            exists = Assignment.objects.filter(**kwargs).exists()

        if exists:
            raise ValidationError("{}: '{}' already exists for Tenant: '{}'"
                                  .format(self.field, field_value, tenant.id))

    def set_context(self, serializer=None):
        """Determine the existing instance, prior to the validation
        call being made."""
        self.instance = getattr(serializer, 'instance', None)
