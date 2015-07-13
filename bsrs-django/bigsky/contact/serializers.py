import re

from rest_framework import serializers

from contact.models import (
    PhoneNumberType, PersonPhoneNumber, LocationPhoneNumber,
    AddressType, PersonAddress, LocationAddress, EmailType,
    PersonEmail
    )


class PhoneNumberTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = PhoneNumberType
        fields = ('id', 'name')


PHONE_NUMBER_FIELDS_LIST = ('id', 'number', 'type')
PHONE_NUMBER_FIELDS_DETAIL = ('id', 'number', 'type', 'location', 'person')


class PhoneNumberSerializer(serializers.ModelSerializer):
    '''
    Use a PATCH and PrimaryKeyRelated field to just add [user pk, new ph_num] 
    when adding a new phone number for a User.
    '''

    class Meta:
        model = PersonPhoneNumber
        fields = PHONE_NUMBER_FIELDS
        
    def validate_number(self, value):
        """
        All phone numbes should be submitted as: \d{10}
        """
        value = re.sub(r"\d", "", value)
        if len(value) != 10:
            raise serializers.ValidationError("Phone Number does not include 10 digits")
        value = value[0:3] + '-' + value[3:6] + '-' + value[6:10]
        return value
    

class PhoneNumberShortSerializer(PhoneNumberSerializer):

    type = PhoneNumberTypeSerializer(read_only=True)

    class Meta:
        model = PersonPhoneNumber
        fields = ('id', 'number', 'type')
        

class AddressTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = AddressType


class AddressSerializer(serializers.ModelSerializer):

    class Meta:
        model = PersonAddress


class AddressShortSerializer(AddressSerializer):

    type_name = serializers.CharField(source='type.name', read_only=True)

    class Meta:
        model = PersonAddress
        fields = ('id', 'address1', 'address2', 'address3', 'city', 'state', 'country',
                  'postalcode', 'type_name') 


class EmailTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = EmailType
        

class EmailSerializer(serializers.ModelSerializer):

    class Meta:
        model = PersonEmail


class EmailShortSerializer(EmailSerializer):

    type_name = serializers.CharField(source='type.name', read_only=True)

    class Meta:
        model = PersonEmail
        fields = ('id', 'email', 'type_name') 
