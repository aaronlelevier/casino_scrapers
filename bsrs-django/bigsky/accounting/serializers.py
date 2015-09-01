from accounting.models import Currency
from util.serializers import BaseCreateSerializer

### CURRENCY

class CurrencySerializer(BaseCreateSerializer):

    class Meta:
        model = Currency
        fields = ('id', 'name', 'name_plural', 'code', 'symbol', 'symbol_native',
            'decimal_digits', 'rounding',)