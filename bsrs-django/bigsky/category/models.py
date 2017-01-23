from django.db import models
from django.conf import settings
from django.db.models import Q

from accounting.models import Currency
from location.models import SelfReferencingQuerySet, SelfReferencingManager
from tenant.models import Tenant
from utils import classproperty
from utils.fields import SelfInheritedValueField
from utils.models import BaseModel, BaseNameModel, DefaultNameManager


LABEL_ACTIVE = 'category.status.active'
LABEL_INACTIVE = 'category.status.inactive'
LABEL_TYPE = 'Type'
LABEL_TRADE = 'Trade'
LABEL_ISSUE = 'Issue'
LABEL_SUB_ISSUE = 'Sub-Issue'

CATEGORY_STATUSES = [
    LABEL_ACTIVE,
    LABEL_INACTIVE,
    LABEL_TYPE,
    LABEL_TRADE,
    LABEL_ISSUE,
    LABEL_SUB_ISSUE
]


class CategoryStatus(BaseNameModel):

    default = CATEGORY_STATUSES[0]

    objects = DefaultNameManager()

    class Meta:
        verbose_name_plural = "Category statuses"


class CategoryQuerySet(SelfReferencingQuerySet):

    def get_all_if_none(self, role):
        if not role.categories.count():
            return Category.objects.all().values_list('id', flat=True)
        return role.categories.all().values_list('id', flat=True)

    def search_power_select(self, keyword):
        return self.filter(
            Q(name__icontains=keyword) | \
            Q(cost_code__icontains=keyword)
        )

    def search_multi(self, keyword):
        return self.filter(
            Q(name__icontains=keyword) | \
            Q(description__icontains=keyword) | \
            Q(label__icontains=keyword)
        )

    def ordered_parents_and_self_as_strings(self, keyword):
        return sorted(self.filter(name__icontains=keyword),
                      key=lambda x: x.parents_and_self_as_string())


class CategoryManager(SelfReferencingManager):

    queryset_cls = CategoryQuerySet

    def get_all_if_none(self, role):
        return self.get_queryset().get_all_if_none(role)

    def search_power_select(self, keyword):
        return self.get_queryset().search_power_select(keyword)

    def search_multi(self, keyword):
        return self.get_queryset().search_multi(keyword)

    def ordered_parents_and_self_as_strings(self, keyword):
        return self.get_queryset().ordered_parents_and_self_as_strings(keyword)


class Category(BaseModel):
    """
    Category tree. Categories are self referencing OneToMany.  A Parent has
    many Children.

    - Parent or Label is required to create a Category.
    - If the ``parent`` FK is null, then it is a Top Level Category.
    """
    _RAW_EXPORT_FIELDS_AND_HEADERS = [
        ('name', 'admin.category.label.name'),
        ('description', 'admin.category.label.description'),
        ('label', 'admin.category.label.label'),
        ('cost_amount', 'admin.category.label.cost_amount'),
        ('cost_code', 'admin.category.label.cost_code')
    ]

    @classproperty
    def EXPORT_FIELDS(cls):
        return [x[0] for x in cls._RAW_EXPORT_FIELDS_AND_HEADERS]

    @classproperty
    def I18N_HEADER_FIELDS(cls):
        return [x[1] for x in cls._RAW_EXPORT_FIELDS_AND_HEADERS]

    tenant = models.ForeignKey(Tenant, related_name="categories")
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=100, blank=True, null=True)
    label = models.CharField(max_length=100, editable=False, blank=True, null=True,
        help_text="This field cannot be set directly.  It is either set from "
                  "a system setting, or defaulted from the Parent Category.")
    subcategory_label = models.CharField(max_length=100, blank=True)
    sc_category_name = models.CharField(max_length=100, null=True,
                                  help_text="Mapping to SC Category name")
    cost_amount = models.DecimalField(max_digits=15, decimal_places=4, null=True,
                                      help_text="aka (NTE) not to exceed amount")
    cost_currency = models.ForeignKey(Currency, blank=True, null=True)
    cost_code = models.CharField(max_length=100, blank=True, null=True)
    parent = models.ForeignKey("self", related_name="children", blank=True, null=True)
    status = models.ForeignKey(CategoryStatus, blank=True, null=True)
    level = models.IntegerField(blank=True, default=0,
        help_text="A count of how many parent categories that this Category has.")

    objects = CategoryManager()

    class Meta:
        ordering = ('level',)
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self._update_defalts()
        return super(Category, self).save(*args, **kwargs)

    def _update_defalts(self):
        if not self.label:
            if self.parent and self.parent.subcategory_label:
                self.label = self.parent.subcategory_label
            else:
                self.label = settings.TOP_LEVEL_CATEGORY_LABEL

        if not self.status:
            self.status = CategoryStatus.objects.default()

        if not self.cost_currency:
            self.cost_currency = Currency.objects.default()

        self.level = self._set_level()

    def _set_level(self):
        count = 0

        if not self.parent:
            return count
        else:
            return self._get_parent_count(self.parent, count+1)

    def _get_parent_count(self, category, count):
        if not category.parent:
            return count
        else:
            return self._get_parent_count(category.parent, count+1)

    @property
    def inherited(self):
        return {
            'cost_amount': self.proxy_cost_amount,
            'sc_category_name': self.proxy_sc_category_name,
            'cost_code': self.proxy_cost_code
        }

    proxy_cost_amount = SelfInheritedValueField('parent', 'cost_amount')
    proxy_sc_category_name = SelfInheritedValueField('parent', 'sc_category_name')
    proxy_cost_code = SelfInheritedValueField('parent', 'cost_code')

    def to_dict(self):
        if self.parent:
            return {
                "id": str(self.pk),
                "name": self.name,
                "status": str(self.status),
                "parent": {
                    "id": str(self.parent.pk),
                    "name": self.parent.name
                },
            }
        else:
            return {
                "id": str(self.pk),
                "name": self.name,
                "status": str(self.status),
                "parent": None,
            }

    def to_simple_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'parent': str(self.parent.id) if self.parent else None,
            'level': self.level
        }

    def parents_and_self_as_string(self, category=None, names=None):
        """
        For use with the AutomationFilter for Categories to display to
        the User which Categories they have selected, their parents,
        and if they have child categories.

        Returns:
            "parent - child - grand_child - etc..."

            If the category has children, since only returns names from
            it's parents, will append the string "all" to the end.
        """
        if not category:
            category = self

        if not names:
            names = []

        names.append({'level': category.level, 'name': category.name})

        if not category.parent:
            sorted_list = sorted(names, key=lambda k: k['level'])
            return " - ".join([s['name'] for s in sorted_list])
        else:
            return self.parents_and_self_as_string(category.parent, names)
