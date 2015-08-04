from rest_framework import serializers

from contact.serializers import (PhoneNumberSerializer, AddressSerializer,
    EmailSerializer)
from location.models import LocationLevel, LocationStatus, LocationType, Location


### BASE

class BaseSerializer(serializers.ModelSerializer):
    '''
    Base Serializer for all ModelSerializer ID Fields.
    '''
    id = serializers.UUIDField(read_only=False)


### LOCATION LEVEL

class LocationLevelSerializer(serializers.ModelSerializer):

    id = serializers.UUIDField(read_only=False)

    class Meta:
        model = LocationLevel
        fields = ('id', 'name',)


class LocationLevelDetailSerializer(serializers.ModelSerializer):

    children = LocationLevelSerializer(many=True)
    parents = LocationLevelSerializer(many=True)

    class Meta:
        model = LocationLevel
        fields = ('id', 'name', 'children', 'parents',)


class LocationLevelCreateSerializer(serializers.ModelSerializer):
    '''
    TODO: Nested Create/Update of ``children``
    '''

    id = serializers.UUIDField(read_only=False)

    class Meta:
        model = LocationLevel
        fields = ('id', 'name', 'children',)


### LOCATION STATUS

class LocationStatusSerializer(serializers.ModelSerializer):

    class Meta:
        model = LocationStatus
        fields = ('id', 'name')


### LOCATION TYPE

class LocationTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = LocationType
        fields = ('id', 'name')


### LOCATION

class LocationIdNameSerializer(serializers.ModelSerializer):

    class Meta:
        model = Location
        fields = ('id', 'name')


# class LocationSerializer(serializers.ModelSerializer):

#     class Meta:
#         model = Location
#         fields = ('id', 'name', 'number', 'location_level', 'status', 'type',
#                   'people', 'children')

        
class LocationListSerializer(serializers.ModelSerializer):
    
    status = LocationStatusSerializer()
    location_level = LocationLevelSerializer()
    
    class Meta:
        model = Location
        fields = ('id', 'name', 'number', 'status', 'location_level',)


class LocationDetailSerializer(serializers.ModelSerializer):
    
    location_level = LocationLevelDetailSerializer()

    class Meta:
        model = Location
        fields = ('id', 'name', 'number', 'location_level',)










