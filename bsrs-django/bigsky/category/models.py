import json

from django.db import models
from django.conf import settings

from accounting.models import Currency
from utils.models import AbstractName, BaseManager, BaseModel


### CATEGORY

class CategoryManager(BaseManager):

    @property
    def d3_json(self):
        models = []
        for category in Category.objects.all():
            if category.parent:
                models.append({"source": category.parent.name, "target": category.name, "type": "suit"})
        return json.dumps(models)

    @property
    def d3_json_tree(self):
        """
        TODO: 

        - Only works for the first level of Children currently.
        - To use with this tempalate: `d3_tree.html`
        """
        def categories(array=None):
            if not array:
                array = []
                for category in Category.objects.filter(parent__isnull=True):
                    array.append({
                            "id": str(category.id),
                            "name": category.name,
                            "parent": "null" if not category.parent else category.parent.name,
                            "children": [],
                            "checked": False
                        })
                categories(array)
            else:
                for i, arr in enumerate(array):
                    if not arr["children"] and not arr["checked"]:
                        array[i]["checked"] = True

                        category = Category.objects.get(id=arr["id"])
                        children = category.children.all()
                        for child in children:
                            array[i]["children"].append({
                                    "id": str(child.id),
                                    "name": child.name,
                                    "parent": category.name,
                                    "children": [],
                                    "checked": False
                                })
                            categories(array)
            return array

        return json.dumps(categories())


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
