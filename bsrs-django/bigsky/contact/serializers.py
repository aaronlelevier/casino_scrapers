from rest_framework import serializers

from contact.models import (PhoneNumberType, PhoneNumber, AddressType,
    Address, EmailType, Email)
from utils.serializers import BaseCreateSerializer


### PHONE NUMBER ###

class PhoneNumberTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = PhoneNumberType
        fields = ('id', 'name')


class PhoneNumberFlatSerializer(BaseCreateSerializer):
    """Used for Person detail/update serializer leaf node."""

    class Meta:
        model = PhoneNumber
        fields = ('id', 'type', 'number',)


class PhoneNumberSerializer(BaseCreateSerializer):

    class Meta:
        model = PhoneNumber
        fields = ('id', 'type', 'number',)


### ADDRESS ###

class AddressTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = AddressType
        fields = ('id', 'name',)


class AddressFlatSerializer(BaseCreateSerializer):
    
    class Meta:
        model = Address
        fields = ('id', 'type', 'address1', 'address2', 'city', 'state',
            'country', 'zip',)


class AddressSerializer(BaseCreateSerializer):
    
    class Meta:
        model = Address
        fields = ('id', 'type', 'address1', 'address2', 'city', 'state',
            'country', 'zip',)


### EMAIL ###

class EmailTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = EmailType
        fields = ('id', 'name',)


class EmailFlatSerializer(BaseCreateSerializer):
    
    class Meta:
        model = Email
        fields = ('id', 'type', 'email',)


class EmailSerializer(BaseCreateSerializer):

    type = EmailTypeSerializer()
    
    class Meta:
        model = Email
        fields = ('id', 'type', 'email',)
