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
            try:
                content_type = self.is_model_class(self.context)
            except ValidationError as e:
                raise e
        else:
            content_type = settings.DEFAULT_PROFILE_FILTER_CONTEXT

            klass = content_type.model_class()

    def set_context(self, serializer=None):
        """Determine the existing instance, prior to the validation
        call being made."""
        self.instance = getattr(serializer, 'instance', None)
        print('instance:', self.instance)

    @staticmethod
    def is_model_class(value):
        try:
            app_label, model = value.split('.')
        except ValueError:
            raise ValidationError("{} must be an 'app_label.model'".format(value))

        try:
            content_type = ContentType.objects.get(app_label=app_label, model=model)
        except ContentType.DoesNotExist:
            raise ValidationError("'{}' content type does not exist.".format(value))

        return content_type
