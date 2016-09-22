from rest_framework import serializers

from contact.models import (PhoneNumberType, PhoneNumber, AddressType,
    Address, EmailType, Email, Country, State)
from utils.serializers import BaseCreateSerializer


class StateIdNameSerializer(BaseCreateSerializer):

    class Meta:
        model = State
        fields = ('id', 'name',)


class StateListSerializer(BaseCreateSerializer):

    class Meta:
        model = State
        fields = ('id', 'name', 'state_code', 'classification',)


class CountryListSerializer(BaseCreateSerializer):

    class Meta:
        model = Country
        fields = ('id', 'common_name', 'three_letter_code')


class CountryDetailSerializer(BaseCreateSerializer):

    states = StateIdNameSerializer(many=True)

    class Meta:
        model = Country
        fields = ('id', 'common_name', 'three_letter_code', 'states')


class CountryIdNameSerializer(BaseCreateSerializer):

    id = serializers.UUIDField(required=False)
    name = serializers.CharField(source='common_name')

    class Meta:
        model = Country
        fields = ('id', 'name')


### PHONE NUMBER ###

class PhoneNumberTypeSerializer(BaseCreateSerializer):

    class Meta:
        model = PhoneNumberType
        fields = ('id', 'name')


class PhoneNumberSerializer(BaseCreateSerializer):

    class Meta:
        model = PhoneNumber
        fields = ('id', 'type', 'number',)


### ADDRESS ###

class AddressTypeSerializer(BaseCreateSerializer):

    class Meta:
        model = AddressType
        fields = ('id', 'name',)


class AddressSerializer(BaseCreateSerializer):
    
    type = AddressTypeSerializer(read_only=True)
    state = StateIdNameSerializer()
    country = CountryIdNameSerializer()

    class Meta:
        model = Address
        fields = ('id', 'type', 'address', 'city', 'state',
            'country', 'postal_code',)


class AddressUpdateSerializer(BaseCreateSerializer):

    class Meta:
        model = Address
        fields = ('id', 'type', 'address', 'city', 'state',
            'country', 'postal_code',)


### EMAIL ###

class EmailTypeSerializer(BaseCreateSerializer):

    class Meta:
        model = EmailType
        fields = ('id', 'name',)


class EmailSerializer(BaseCreateSerializer):

    class Meta:
        model = Email
        fields = ('id', 'type', 'email',)
