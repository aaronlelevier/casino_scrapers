from django.conf import settings
from django.db import models

from utils.models import BaseModel


class Profile(BaseModel):
    description = models.CharField(max_length=500, unique=True)
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL,
                                 related_name="assignee_profiles")
