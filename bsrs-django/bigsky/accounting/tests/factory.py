from collections import namedtuple

from accounting.models import Currency
from utils.helpers import generate_uuid


CURRENCIES = [
    ['Chinese Yuan', 'Chinese Yuan', 'CNY', 'CN¥', 'CN¥', '2'],
    ['Canadian Dollar', 'Canadian Dollars', 'CAD', 'CA$', '$', '2'],
    ['Euro', 'Euros', 'EUR', '€', '€', '2'],
    ['US Dollar', 'US Dollars', 'USD', '$', '$', '2']
]

CurrencyData = namedtuple('CurrencyData',
                          ['name', 'name_plural', 'code',
                           'symbol', 'symbol_native', 'decimal_digits'])

def create_currency(code='USD'):
    try:
        c = [c for c in CURRENCIES if c[2] == code][0]
    except IndexError as e:
        # 'Not a Currency valid code'
        raise e

    data = CurrencyData._make(c)._asdict()
    return get_or_create_currency(**data)


def create_currencies():
    for c in CURRENCIES:
        data = CurrencyData._make(c)._asdict()
        get_or_create_currency(**data)


def get_or_create_currency(**kwargs):
    try:
        currency = Currency.objects.get(code=kwargs['code'])
    except Currency.DoesNotExist:
        kwargs['id'] = generate_uuid(Currency)
        currency = Currency.objects.create(**kwargs)
    return currency
