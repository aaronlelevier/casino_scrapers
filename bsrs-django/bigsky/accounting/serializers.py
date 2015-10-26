from accounting.models import Currency
from utils.serializers import BaseCreateSerializer, UpperCaseSerializerField

### CURRENCY

class CurrencySerializer(BaseCreateSerializer):

    code = UpperCaseSerializerField()

    class Meta:
        model = Currency
        fields = ('id', 'name', 'name_plural', 'code', 'symbol', 'symbol_native',
            'decimal_digits', 'rounding',)