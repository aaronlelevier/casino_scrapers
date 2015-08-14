from django.db import models

from util.models import AbstractName, BaseModel


class CategoryType(AbstractName):
    """Single Parent / Child Hierarchical Structure."""
    child = models.OneToOneField("self", related_name="parent", blank=True, null=True)