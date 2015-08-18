from django.db import models
from django.conf import settings

from accounting.models import Currency
from util.models import AbstractName, BaseManager


### CATEGORY

class Category(AbstractName):
    """
    Category tree. Categories are self referencing OneToMany.  A Parent has 
    many Children.
    """
    description = models.CharField(max_length=100, blank=True, null=True)
    label = models.CharField(max_length=100, blank=True, null=True)
    subcategory_label = models.CharField(max_length=100)
    cost_amount = models.DecimalField(max_digits=15, decimal_places=4, blank=True, default=0)
    cost_currency = models.ForeignKey(Currency, blank=True, null=True)
    cost_code = models.CharField(max_length=100, blank=True, null=True)
    parent = models.ForeignKey("self", related_name='children', blank=True, null=True)

    def save(self, *args, **kwargs):
        '''
        Parent or Label is required to create a Category.
        '''
        if not self.parent:
            self.label = settings.TOP_LEVEL_CATEGORY_LABEL
        else:
            self.label = self.parent.subcategory_label

        if not self.cost_currency:
            self.cost_currency = Currency.objects.default()

        return super(Category, self).save(*args, **kwargs)