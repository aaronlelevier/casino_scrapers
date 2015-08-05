from django.db import models
from django.utils.encoding import python_2_unicode_compatible

from util.models import BaseModel, BaseManager


class CurrencyManager(BaseManager):

    def default(self):
        obj, created = Currency.objects.get_or_create(
            name="US Dollar",
            code="usd",
            symbol="$",
            format="$00.00"
        )
        return obj


@python_2_unicode_compatible
class Currency(BaseModel):
    "Accepted Currencies"
    name = models.CharField(max_length=50, help_text="US Dollar")
    code = models.CharField(max_length=3, help_text="usd")
    symbol = models.CharField(max_length=1, help_text="$")
    format = models.CharField(max_length=10, help_text="$00.00 for 'usd' for example")

    objects = CurrencyManager()

    def __str__(self):
        return self.name


@python_2_unicode_compatible
class AuthAmount(BaseModel):
    amount = models.DecimalField(max_digits=15, decimal_places=4, blank=True, default=0)
    currency = models.ForeignKey(Currency, blank=True, null=True)

    def __str__(self):
        return self.amount