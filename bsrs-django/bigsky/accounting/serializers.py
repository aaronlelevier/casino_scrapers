from rest_framework import serializers

from accounting.models import Currency
from util.serializers import BaseCreateSerializer


### CURRENCY

class CurrencySerializer(BaseCreateSerializer):

    class Meta:
        model = Currency
        fields = ('id', 'name', 'code', 'symbol', 'format',)
