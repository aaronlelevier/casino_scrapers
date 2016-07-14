from django.conf import settings
from django.contrib.auth.models import ContentType
from django.db import models

from rest_framework.exceptions import ValidationError


class ValidateProfileFilterField(object):
    """Validate that the Model class returned by the 'context' has
    the 'field'."""

    def __call__(self, data):
        self.id = data.get('id', None)
        self.context = data.get('context', None)
        self.field = data.get('field', None)
        self.criteria = data.get('criteria', [])

        if self.context:
            content_type = self.is_model_class()
        else:
            content_type = settings.DEFAULT_PROFILE_FILTER_CONTEXT

        klass = content_type.model_class()
        context_field_model = self.is_model_field(klass)

    def set_context(self, serializer=None):
        """Determine the existing instance, prior to the validation
        call being made."""
        self.instance = getattr(serializer, 'instance', None)
        print('instance:', self.instance)

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
