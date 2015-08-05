from accounting.models import Currency, AuthAmount
from util.serializers import BaseCreateSerializer


class CurrencySerializer(BaseCreateSerializer):

    class Meta:
        model = Currency
        fields = ('id', 'name', 'code', 'symbol', 'format',)


class AuthAmountSerializer(BaseCreateSerializer):

    class Meta:
        model = AuthAmount
        fields = ('id', 'amount', 'currency')