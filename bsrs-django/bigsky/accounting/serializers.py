from rest_framework import serializers

from accounting.models import Currency
from utils.serializers import BaseCreateSerializer, UpperCaseSerializerField


class CurrencySerializer(BaseCreateSerializer):

    code = UpperCaseSerializerField()

    class Meta:
        model = Currency
        fields = ('id', 'name', 'name_plural', 'code', 'symbol', 'symbol_native',
                  'decimal_digits', 'rounding',)


class CurrencyIdNameSerializer(serializers.ModelSerializer):

    class Meta:
        model = Currency
        fields = ('id', 'name')
