from django.db import models
from django.conf import settings

from accounting.models import Currency
from util.models import AbstractName, BaseManager


### CATEGORY

class Category(AbstractName):
    """

    """
    description = models.CharField(max_length=100, blank=True, null=True)
    label = models.CharField(max_length=100, blank=True, null=True)
    subcategory_label = models.CharField(max_length=100, blank=True, null=True)
    cost_amount = models.DecimalField(max_digits=15, decimal_places=4, blank=True, default=0)
    cost_currency = models.ForeignKey(Currency, blank=True, null=True)
    cost_code = models.CharField(max_length=100, blank=True, null=True)
    parent = models.ForeignKey("self", related_name='children', blank=True, null=True)

    def save(self, *args, **kwargs):
        return super(Category, self).save(*args, **kwargs)