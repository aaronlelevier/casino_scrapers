import csv
import os

from django.conf import settings
from django.db import models
from django.db.models import Q

from accounting.models import Currency
from location.models import SelfReferencingManager, SelfReferencingQuerySet
from tenant.models import Tenant
from utils import classproperty
from utils.fields import SelfInheritedValueField
from utils.helpers import get_gspread_connection
from utils.models import (BaseManager, BaseModel, BaseNameModel, BaseQuerySet,
                          DefaultNameManager)

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

    def search_multi(self, keyword):
        return self.filter(
            Q(name__icontains=keyword) | \
            Q(description__icontains=keyword) | \
            Q(label__icontains=keyword) | \
            Q(cost_code__icontains=keyword)
        )


class CategoryManager(SelfReferencingManager):

    queryset_cls = CategoryQuerySet

    def get_all_if_none(self, role):
        return self.get_queryset().get_all_if_none(role)

    def search_multi(self, keyword):
        return self.get_queryset().search_multi(keyword)


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
    verbose_name = models.CharField(max_length=1000, null=True,
        help_text="string name that holds i.e. parent - child - grand child")
    description = models.CharField(max_length=100, blank=True, null=True)
    label = models.CharField(max_length=100, editable=False, blank=True, null=True,
        help_text="This field cannot be set directly.  It is either set from "
                  "a system setting, or defaulted from the Parent Category.")
    subcategory_label = models.CharField(max_length=100, blank=True)
    cost_amount = models.DecimalField(max_digits=15, decimal_places=4, null=True,
                                      help_text="aka (NTE) not to exceed amount")
    cost_currency = models.ForeignKey(Currency, blank=True, null=True)
    cost_code = models.CharField(max_length=100, blank=True, null=True)
    parent = models.ForeignKey("self", related_name="children", blank=True, null=True)
    status = models.ForeignKey(CategoryStatus, blank=True, null=True)
    level = models.IntegerField(blank=True, default=0,
        help_text="A count of how many parent categories that this Category has.")
    sc_category = models.ForeignKey("category.ScCategory", null=True,
        help_text="Mapping to SC Category name. Can be null because this is an inherited field,"
                  "but all root categories must have this.")

    objects = CategoryManager()

    class Meta:
        ordering = ('level',)
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name

    def save(self, update_children=True, *args, **kwargs):
        self._update_defalts()
        self.verbose_name = self.parents_and_self_as_string()

        super(Category, self).save(*args, **kwargs)

        # must call `save` on children in order to update their
        # `verbose_name` which could go stale if parent name changes
        if update_children:
            for x in Category.objects.get_all_children(self):
                x.save(update_children=False)

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

        self.level = self._get_parent_count()

    def _get_parent_count(self, category=None, count=0):
        if not category:
            category = self

        if not category.parent:
            return count
        else:
            return self._get_parent_count(category.parent, count+1)

    @property
    def inherited(self):
        return {
            'cost_amount': self.proxy_cost_amount,
            'cost_code': self.proxy_cost_code,
            'sc_category': self.proxy_sc_category
        }

    proxy_cost_amount = SelfInheritedValueField('cost_amount')
    proxy_cost_code = SelfInheritedValueField('cost_code')
    proxy_sc_category = SelfInheritedValueField('sc_category')

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


encoding = 'ISO-8859-2'

SC_TRADES_CSV = "sc_trades.csv"


class ScCategoryQuerySet(BaseQuerySet):
    pass


class ScCategoryManager(BaseManager):

    queryset_cls = ScCategoryQuerySet

    def download_sc_trades(self):
        """
        Connect to Google Sheets and download 'SC Categories' to CSV
        """
        gc = get_gspread_connection()
        wks = gc.open('SC Primary Trades').sheet1

        with open(os.path.join(os.path.join(settings.MEDIA_ROOT, 'sc'), SC_TRADES_CSV), 'w', newline='') as csvfile:
            writer = csv.writer(csvfile, delimiter=',')
            for row in wks.get_all_values():
                writer.writerow(row)

    def import_sc_trades(self):
        """
        Read 'SC Categories' from CSV and write to database
        """
        file_str = os.path.join(os.path.join(settings.MEDIA_ROOT, "sc"), SC_TRADES_CSV)

        with open(file_str, encoding=encoding) as csvfile:
            reader = csv.DictReader(csvfile)
            for i, row in enumerate(reader):
                try:
                    self.create(
                        sc_name=row['sc_name'],
                        key=row['i18n']
                    )
                except Exception as e:
                    print(i, ":", e)


class ScCategory(BaseModel):
    """
    Fixture records to store the SC category trade names along
    with i18n keys for use in UI.
    """
    sc_name = models.CharField(max_length=100, unique=True,
        help_text="SC trade name")
    key = models.CharField(max_length=100, unique=True,
        help_text="i18n key of string name for UI. English version will be the prettified 'SC trade name'.")

    objects = ScCategoryManager()

    def __str__(self):
        return self.sc_name
