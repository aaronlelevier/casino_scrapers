from rest_framework import serializers

from contact.serializers import (PhoneNumberSerializer, AddressSerializer,
    EmailSerializer)
from location.models import LocationLevel, LocationStatus, LocationType, Location
from util.serializers import BaseCreateSerializer


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


class LocationLevelCreateSerializer(BaseCreateSerializer):
    '''
    TODO: Nested Create/Update of ``children``
    '''

    class Meta:
        model = LocationLevel
        fields = ('id', 'name', 'children',)


### LOCATION STATUS

class LocationStatusSerializer(BaseCreateSerializer):

    class Meta:
        model = LocationStatus
        fields = ('id', 'name')


### LOCATION TYPE

class LocationTypeSerializer(BaseCreateSerializer):

    class Meta:
        model = LocationType
        fields = ('id', 'name')


### LOCATION

class LocationIdNameSerializer(serializers.ModelSerializer):

    class Meta:
        model = Location
        fields = ('id', 'name')


class LocationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Location
        fields = ('id', 'name', 'number', 'location_level',)

        
class LocationListSerializer(serializers.ModelSerializer):
    
    status = LocationStatusSerializer()
    location_level = LocationLevelSerializer()
    
    class Meta:
        model = Location
        fields = ('id', 'name', 'number', 'status', 'location_level',)


class LocationDetailSerializer(serializers.ModelSerializer):
    
    location_level = LocationLevelDetailSerializer()
    parents = LocationSerializer(many=True)
    children = LocationSerializer(many=True)

    class Meta:
        model = Location
        fields = ('id', 'name', 'number', 'location_level', 'status',
            'parents', 'children',)


class LocationCreateSerializer(BaseCreateSerializer):

    class Meta:
        model = Location
        fields = ('id', 'name', 'number', 'status', 'location_level',)


class LocationUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Location
        fields = ('id', 'name', 'number', 'status', 'location_level',
            'parents', 'children',)








