from rest_framework import serializers

from contact.models import (PhoneNumberType, PhoneNumber, AddressType,
    Address, EmailType, Email, Country, State)
from utils.serializers import BaseCreateSerializer


class StateLeafSerializer(serializers.ModelSerializer):

    class Meta:
        model = State
        field = ('id', 'name',)


class StateListSerializer(serializers.ModelSerializer):

    class Meta:
        model = State
        field = ('id', 'name', 'state_code', 'classification',)


class CountryListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Country
        fields = ('id', 'common_name', 'three_letter_code')


class CountryDetailSerializer(serializers.ModelSerializer):

    states = StateLeafSerializer(many=True)

    class Meta:
        model = Country
        fields = ('id', 'common_name', 'three_letter_code', 'states')


class CountryIdNameSerializer(serializers.ModelSerializer):

    name = serializers.CharField(source='common_name')

    class Meta:
        model = Country
        fields = ('id', 'name')


### PHONE NUMBER ###

class PhoneNumberTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = PhoneNumberType
        fields = ('id', 'name')


class PhoneNumberSerializer(BaseCreateSerializer):

    class Meta:
        model = PhoneNumber
        fields = ('id', 'type', 'number',)


### ADDRESS ###

class AddressTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = AddressType
        fields = ('id', 'name',)


class AddressSerializer(BaseCreateSerializer):
    
    class Meta:
        model = Address
        fields = ('id', 'type', 'address', 'city', 'state',
            'country', 'postal_code',)


### EMAIL ###

class EmailTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = EmailType
        fields = ('id', 'name',)


class EmailSerializer(BaseCreateSerializer):

    class Meta:
        model = Email
        fields = ('id', 'type', 'email',)
