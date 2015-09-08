import json

from django.db import models
from django.conf import settings

from accounting.models import Currency
from util.models import AbstractName, BaseManager, BaseModel


### CATEGORY

class CategoryManager(BaseManager):

    @property
    def d3_json(self):
        models = []
        for category in Category.objects.all():
            if category.parent:
                models.append({"source": category.parent.name, "target": category.name, "type": "suit"})
        return json.dumps(models)


class Category(BaseModel):
    """
    Category tree. Categories are self referencing OneToMany.  A Parent has 
    many Children.

    - Parent or Label is required to create a Category.
    - If the ``parent`` FK is null, then it is a Top Level Category.
    """
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=100, blank=True, null=True)
    label = models.CharField(max_length=100, editable=False, blank=True, null=True,
        help_text="This field cannot be set directly.  It is either set from "
                  "a system setting, or defaulted from the Parent Category.")
    subcategory_label = models.CharField(max_length=100)
    cost_amount = models.DecimalField(max_digits=15, decimal_places=4, blank=True, default=0)
    cost_currency = models.ForeignKey(Currency, blank=True, null=True)
    cost_code = models.CharField(max_length=100, blank=True, null=True)
    parent = models.ForeignKey("self", related_name="children", blank=True, null=True)

    objects = CategoryManager()

    def save(self, *args, **kwargs):
        self._update_defalts()
        return super(Category, self).save(*args, **kwargs)

    def _update_defalts(self):
        if not self.parent:
            self.label = settings.TOP_LEVEL_CATEGORY_LABEL
        else:
            self.label = self.parent.subcategory_label
            
        if not self.cost_currency:
            self.cost_currency = Currency.objects.default()