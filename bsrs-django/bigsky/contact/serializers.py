from rest_framework import serializers

from contact.models import (PhoneNumberType, PhoneNumber, AddressType,
    Address, EmailType, Email)
from person.models import Person
from utils.serializers import BaseCreateSerializer


### PHONE NUMBER ###

class PhoneNumberTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = PhoneNumberType
        fields = ('id', 'name')


class PhoneNumberNodeSerializer(BaseCreateSerializer):
    """Used for Person detail/update serializer leaf node."""

    class Meta:
        model = PhoneNumber
        fields = ('id', 'type', 'number',)


class PhoneNumberSerializer(BaseCreateSerializer):

    class Meta:
        model = PhoneNumber
        fields = ('id', 'type', 'number', 'object_id',)


### ADDRESS ###

class AddressTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = AddressType
        fields = ('id', 'name',)


class AddressNodeSerializer(BaseCreateSerializer):
    
    class Meta:
        model = Address
        fields = ('id', 'type', 'address', 'city', 'state',
            'country', 'postal_code',)


class AddressSerializer(BaseCreateSerializer):
    
    class Meta:
        model = Address
        fields = ('id', 'type', 'address', 'city', 'state',
            'country', 'postal_code', 'object_id',)


### EMAIL ###

class EmailTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = EmailType
        fields = ('id', 'name',)


class EmailNodeSerializer(BaseCreateSerializer):
    
    class Meta:
        model = Email
        fields = ('id', 'type', 'email',)


class EmailSerializer(BaseCreateSerializer):
    
    class Meta:
        model = Email
        fields = ('id', 'type', 'email', 'object_id',)
