from collections import namedtuple

from accounting.models import Currency
from utils.helpers import generate_uuid


CURRENCIES = [
    ['Chinese Yuan', 'Chinese Yuan', 'CNY', 'CN¥', 'CN¥', '2'],
    ['Canadian Dollar', 'Canadian Dollars', 'CAD', 'CA$', '$', '2'],
    ['Euro', 'Euros', 'EUR', '€', '€', '2'],
    ['US Dollar', 'US Dollars', 'USD', '$', '$', '2']
]


def create_currencies():
    CurrencyData = namedtuple('CurrencyData',
                              ['name', 'name_plural', 'code',
                               'symbol', 'symbol_native', 'decimal_digits'])

    for c in CURRENCIES:
        data = CurrencyData._make(c)._asdict()

        try:
            Currency.objects.get(code=data['code'])
        except Currency.DoesNotExist:
            data['id'] = generate_uuid(Currency)
            Currency.objects.create(**data)
