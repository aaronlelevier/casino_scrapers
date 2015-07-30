from rest_framework import serializers

from contact.serializers import (PhoneNumberShortSerializer, AddressShortSerializer,
    EmailShortSerializer)
from location.models import LocationLevel, LocationStatus, LocationType, Location


class BaseSerializer(serializers.ModelSerializer):
    '''
    Base Serializer for all ModelSerializer ID Fields.
    '''
    id = serializers.UUIDField(read_only=False)


class LocationLevelSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=False)

    class Meta:
        model = LocationLevel
        fields = ('id', 'name',)
        

class LocationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocationStatus
        fields = ('id', 'name')


class LocationTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocationType
        fields = ('id', 'name')


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ('id', 'name', 'number', 'level', 'status', 'type',
                  'people', 'children')
        
class LocationGridSerializer(LocationSerializer):
    
    level_name = serializers.CharField(source='level.name', read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)
    type_name = serializers.CharField(source='type.name', read_only=True)
    
    class Meta:
        model = Location
        fields = ('id', 'name', 'number', 'level_name', 'status_name', 'type_name')


class LocationFullSerializer(LocationGridSerializer):
    
    phone_numbers = PhoneNumberShortSerializer(many=True, read_only=True)
    addresses = AddressShortSerializer(many=True, read_only=True)
    emails = EmailShortSerializer(many=True, read_only=True)
    
    class Meta:
        model = Location
        fields = ('id', 'name', 'number', 'level', 'level_name', 'status',
                  'status_name', 'type', 'type_name', 'children',
                  'phone_numbers', 'addresses', 'emails')
