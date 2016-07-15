from django.conf import settings
from django.contrib.auth.models import ContentType

from rest_framework.exceptions import ValidationError

from routing.models import Assignment


class ProfileFilterFieldValidator(object):
    """Validate that the Model class returned by the 'context' has
    the 'field' and that the 'field' has valid 'criteria'."""

    def __call__(self, data):
        self.id = data.get('id', None)
        self.context = data.get('context', None)
        self.field = data.get('field', None)
        self.criteria = data.get('criteria', [])

        if self.context:
            content_type = self.is_model_class()
        else:
            app_label, model = settings.DEFAULT_PROFILE_FILTER_CONTEXT.split('.')
            content_type = ContentType.objects.get(app_label=app_label, model=model)

        klass = content_type.model_class()
        self.is_model_field(klass)
        self.is_valid_field_filter(klass)

    def is_model_class(self):
        try:
            app_label, model = self.context.split('.')
        except ValueError:
            raise ValidationError("{} must be an 'app_label.model'".format(self.context))

        try:
            content_type = ContentType.objects.get(app_label=app_label, model=model)
        except ContentType.DoesNotExist:
            raise ValidationError("'{}' content type does not exist.".format(self.context))

        return content_type

    def is_model_field(self, klass):
        if not hasattr(klass, self.field):
            raise ValidationError("'{}' is not a field on '{}'".format(self.field, klass.__name__))

    def is_valid_field_filter(self, klass):
        rel_klass = klass._meta.get_field(self.field).rel.to
        try:
            if not rel_klass.objects.filter(id__in=self.criteria).exists():
                raise ValidationError("'{}' is not a valid id for '{}'"
                                      .format(self.criteria, rel_klass.__name__))
        except ValueError:
            # raised if a NULL value or non-list type is passed to the try block
            raise ValidationError("'{}' not valid. Must be a list of UUIDs".format(self.criteria))


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
