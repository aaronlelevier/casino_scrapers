from django.conf import settings
from django.db import models

from utils.models import BaseModel


class Profile(BaseModel):
    description = models.TextField()
    order = models.IntegerField(blank=True, default=1)
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL,
                                 related_name="assignee_profiles")
