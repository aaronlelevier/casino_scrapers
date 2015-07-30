from django.db import models
from django.utils.encoding import python_2_unicode_compatible

from util.models import BaseModel, BaseManager


class CurrencyManager(BaseManager):

    def default(self):
        obj, created = Currency.objects.get_or_create(
            name="US Dollar",
            code="usd",
            symbol="$",
            format="00.00"
        )
        return obj


@python_2_unicode_compatible
class Currency(BaseModel):
    "Accepted Currencies"
    name = models.CharField(max_length=50)
    code = models.CharField(max_length=3)
    symbol = models.CharField(max_length=1, help_text="$, ")
    format = models.CharField(max_length=10, help_text="$00.00 for 'USD' for example")

    objects = CurrencyManager()

    def __str__(self):
        return self.name
