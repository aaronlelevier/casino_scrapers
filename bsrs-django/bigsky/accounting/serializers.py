from rest_framework import serializers

from accounting.models import Currency, AuthAmount
from util.serializers import BaseCreateSerializer


### CURRENCY

class CurrencySerializer(BaseCreateSerializer):

    class Meta:
        model = Currency
        fields = ('id', 'name', 'code', 'symbol', 'format',)


### AUTH AMOUNT

class AuthAmountSerializer(BaseCreateSerializer):

    class Meta:
        model = AuthAmount
        fields = ('id', 'amount', 'currency')
