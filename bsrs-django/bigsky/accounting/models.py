from django.db import models
from django.utils.encoding import python_2_unicode_compatible
from django.utils.text import capfirst

from util.models import BaseModel, BaseManager


class CurrencyManager(BaseManager):

    def default(self):
        obj, created = self.get_or_create(name="US Dollar", code="USD",
            symbol="$", decimal_digits=2, rounding=0)
        return obj


@python_2_unicode_compatible
class Currency(BaseModel):
    "Accepted Currencies"
    name = models.CharField(max_length=50, help_text="US Dollar")
    name_plural = models.CharField(max_length=50, help_text="US Dollars", blank=True)
    code = models.CharField(max_length=3, help_text="USD")
    symbol = models.CharField(max_length=10, help_text="$")
    symbol_native = models.CharField(max_length=10, help_text="$", blank=True)
    decimal_digits = models.IntegerField(blank=True, default=0)
    rounding = models.IntegerField(blank=True, default=0)

    objects = CurrencyManager()

    class Meta:
        verbose_name_plural = "Currencies"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self._update_defaults()
        super(Currency, self).save(*args, **kwargs)

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'name_plural': self.name_plural,
            'code': self.code,
            'symbol': self.symbol,
            'symbol_native': self.symbol_native,
            'decimal_digits': self.decimal_digits,
            'rounding': self.rounding
        }

    def _update_defaults(self):
        self.code = self.code.upper()
        if not self.name_plural:
            self.name_plural = capfirst(self.name+'s')
        if not self.symbol_native:
            self.symbol_native = self.symbol
