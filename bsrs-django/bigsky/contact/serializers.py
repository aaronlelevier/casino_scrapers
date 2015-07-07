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
    

class PhoneNumberShortSerializer(PhoneNumberSerializer):

    type = PhoneNumberTypeSerializer(read_only=True)

    class Meta:
        model = PhoneNumber
        fields = ('id', 'number', 'type')
        

class AddressTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = AddressType


class AddressSerializer(serializers.ModelSerializer):

    class Meta:
        model = Address


class AddressShortSerializer(AddressSerializer):

    type_name = serializers.CharField(source='type.name', read_only=True)

    class Meta:
        model = Address
        fields = ('id', 'address1', 'address2', 'address3', 'city', 'state', 'country',
                  'postalcode', 'type_name') 


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
