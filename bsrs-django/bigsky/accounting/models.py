from django.db import models
from django.core.exceptions import MultipleObjectsReturned, ObjectDoesNotExist
from django.utils.encoding import python_2_unicode_compatible

from util.models import BaseModel, BaseManager


class CurrencyManager(BaseManager):

    def default(self):
        obj, created = self.get_or_create(name="US Dollar", code="usd",
            symbol="$", format="$00.00")
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


class AuthAmountManager(BaseManager):
    
    def default(self):
        default_currency = Currency.objects.default()
        defaults = {'amount':0, 'currency':default_currency}
        try:
            return self.get(**defaults)
        except MultipleObjectsReturned:
            return self.filter(**defaults).first()
        except ObjectDoesNotExist:
            return self.create(**defaults)            


@python_2_unicode_compatible
class AuthAmount(BaseModel):
    amount = models.DecimalField(max_digits=15, decimal_places=4, blank=True, default=0)
    currency = models.ForeignKey(Currency, blank=True, null=True)

    objects = AuthAmountManager()

    def __str__(self):
        return "{0:.4f}".format(self.amount)