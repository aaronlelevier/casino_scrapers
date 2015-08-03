from rest_framework import serializers

from contact.models import (PhoneNumberType, PhoneNumber, AddressType,
    Address, EmailType, Email)


### PHONE NUMBER ###

class PhoneNumberTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = PhoneNumberType
        fields = ('id', 'name')


class PhoneNumberSerializer(serializers.ModelSerializer):
    
    id = serializers.UUIDField(read_only=False)

    class Meta:
        model = PhoneNumber
        fields = ('id', 'type', 'number',)


### ADDRESS ###

class AddressTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = AddressType
        fields = ('id', 'name',)


class AddressSerializer(serializers.ModelSerializer):
    
    id = serializers.UUIDField(read_only=False)

    class Meta:
        model = Address
        fields = ('id', 'type', 'address', 'city', 'state',
            'country', 'postal_code',)

### EMAIL ###

class EmailTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = EmailType
        fields = ('id', 'name',)
        

class EmailSerializer(serializers.ModelSerializer):
    
    id = serializers.UUIDField(read_only=False)

    class Meta:
        model = Email
        fields = ('id', 'type', 'email',)