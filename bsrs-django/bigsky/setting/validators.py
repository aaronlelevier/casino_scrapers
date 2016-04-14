import jsonschema

from rest_framework.exceptions import ValidationError, ParseError


class SettingsSchemaValidator(object):
    """Settings must pass schema validaiton for the object."""

    def __init__(self, model, schema):
        self.model = model
        self.schema = schema

    def __call__(self, kwargs):
        settings = kwargs.get('settings', None)
        if settings:
            try:
                self._evaluate_schema(settings)
            except ParseError as error:
                raise ValidationError('Invalid JSON - {0}'.format(error))

    def _evaluate_schema(self, settings):
        try:
            jsonschema.validate(settings, self.schema)
        except jsonschema.exceptions.ValidationError as error:
            raise ParseError(detail=error.message)