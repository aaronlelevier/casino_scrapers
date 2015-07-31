'''
Big Sky Retail Systems Framework
Contact serializers

Created on Jan 21, 2015

@author: tkrier
'''
import re
from rest_framework import serializers
from contact.models import (PhoneNumberType, PhoneNumber, AddressType,
    Address, EmailType, Email)


class PhoneNumberTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = PhoneNumberType
        fields = ('id', 'name')


class PhoneNumberSerializer(serializers.ModelSerializer):
    '''
    Use a PATCH and PrimaryKeyRelated field to just add [user pk, new ph_num] 
    when adding a new phone number for a User.
    '''

    class Meta:
        model = PhoneNumber
        fields = ('id', 'number', 'type', 'location', 'person')
        
    def validate_number(self, value):
        """
        Check for valid phone number and reformat
        """
        value = re.sub(r"\D", "", value)
        if len(value) != 10:
            raise serializers.ValidationError("Phone Number does not include 10 digits")
        value = value[0:3] + '-' + value[3:6] + '-' + value[6:10]
        return value


class PhoneNumberShortFKSerializer(serializers.ModelSerializer):
    
    id = serializers.UUIDField(read_only=False)

    class Meta:
        model = PhoneNumber
        fields = ('id', 'number', 'type')
    

class PhoneNumberShortSerializer(PhoneNumberShortFKSerializer):

    type = PhoneNumberTypeSerializer(read_only=True)


ADDRESS_FIELDS = ('id', 'type', 'address', 'city', 'state', 'postal_code', 'country',)

class AddressTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = AddressType
        fields = ('id', 'name',)


class AddressSerializer(serializers.ModelSerializer):

    class Meta:
        model = Address


class AddressShortSerializer(serializers.ModelSerializer):

    type = AddressTypeSerializer(read_only=True)

    class Meta:
        model = Address
        fields = ADDRESS_FIELDS


class AddressShortFKSerializer(serializers.ModelSerializer):

    class Meta:
        model = Address
        fields = ADDRESS_FIELDS


class EmailTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = EmailType
        

class EmailSerializer(serializers.ModelSerializer):

    class Meta:
        model = Email


class EmailShortSerializer(EmailSerializer):

    type_name = serializers.CharField(source='type.name', read_only=True)

    class Meta:
        model = Email
        fields = ('id', 'email', 'type_name') 