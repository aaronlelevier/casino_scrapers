from django.db import models
from django.utils.text import capfirst

from utils.fields import UpperCaseCharField
from utils.models import BaseModel, BaseManager


DEFAULT_CURRENCY = {
    'name': 'US Dollar',
    'code': 'USD',
    'symbol': '$',
    'decimal_digits': 2,
    'rounding': 0
}


class CurrencyManager(BaseManager):

    def default(self):
        obj, _ = self.get_or_create(**DEFAULT_CURRENCY)
        return obj


class Currency(BaseModel):
    "Accepted Currencies"
    name = models.CharField(max_length=50, help_text="US Dollar")
    name_plural = models.CharField(max_length=50, help_text="US Dollars", blank=True)
    code = UpperCaseCharField(max_length=3, unique=True, help_text="i.e. USD, JPY, etc...")
    symbol = models.CharField(max_length=10, help_text="$")
    symbol_native = models.CharField(max_length=10, help_text="$", blank=True)
    decimal_digits = models.IntegerField(blank=True, default=0)
    rounding = models.IntegerField(blank=True, default=0)

    objects = CurrencyManager()

    class Meta:
        verbose_name_plural = "Currencies"

    def save(self, *args, **kwargs):
        self._update_defaults()
        super(Currency, self).save(*args, **kwargs)

    def _update_defaults(self):
        if not self.name_plural:
            self.name_plural = capfirst(self.name+'s')

        if not self.symbol_native:
            self.symbol_native = self.symbol

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
