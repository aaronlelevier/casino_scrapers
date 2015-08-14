from django.db import models
from django.conf import settings

from accounting.models import Currency
from util.models import AbstractName, BaseManager


### CATEGORY TYPE

class CategoryTypeManager(BaseManager):

    def default(self):
        obj, _ = self.get_or_create(name=settings.DEFAULT_CATEGORY_TYPE)
        return obj


class CategoryType(AbstractName):
    """Single Parent / Child Hierarchical Structure."""
    child = models.OneToOneField("self", related_name="parent", blank=True, null=True)

    objects = CategoryTypeManager()


### CATEGORY

class Category(AbstractName):
    """
    Multiple ``Categories`` will exist for each ``CategoryType``.
    """
    description = models.CharField(max_length=100)
    type = models.ForeignKey(CategoryType, blank=True, null=True)
    cost_amount = models.DecimalField(max_digits=15, decimal_places=4, blank=True, default=0)
    cost_currency = models.ForeignKey(Currency, blank=True, null=True)
    cost_code = models.CharField(max_length=100, blank=True, null=True)
    parent = models.ForeignKey("self", related_name='children', blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.type:
            self.type = CategoryType.objects.default()
        return super(Category, self).save(*args, **kwargs)