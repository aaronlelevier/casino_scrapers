from rest_framework import serializers

from contact.models import (PhoneNumberType, PhoneNumber, AddressType,
    Address, EmailType, Email)
from utils.serializers import BaseCreateSerializer

### PHONE NUMBER ###

class PhoneNumberTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = PhoneNumberType
        fields = ('id', 'name')


class PhoneNumberSerializer(BaseCreateSerializer):

    class Meta:
        model = PhoneNumber
        fields = ('id', 'type', 'number', 'person',)


### ADDRESS ###

class AddressTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = AddressType
        fields = ('id', 'name',)


class AddressSerializer(BaseCreateSerializer):
    
    class Meta:
        model = Address
        fields = ('id', 'type', 'address', 'city', 'state',
            'country', 'postal_code', 'person',)

### EMAIL ###

class EmailTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = EmailType
        fields = ('id', 'name',)
        

class EmailSerializer(BaseCreateSerializer):
    
    class Meta:
        model = Email
        fields = ('id', 'type', 'email', 'person',)