from rest_framework.exceptions import ValidationError

from django.contrib.auth.models import ContentType
from django.db import models


def is_model_class(value):
    try:
        app_label, model = value.split('.')
    except ValueError:
        raise ValidationError("{} must be an 'app_label.model'".format(value))
        
    try:    
        content_type = ContentType.objects.get(app_label=app_label, model=model)
    except ContentType.DoesNotExist:
        raise ValidationError("'{}' content type does not exist.".format(value))
