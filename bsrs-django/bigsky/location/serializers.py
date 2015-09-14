from rest_framework import serializers

from location.models import LocationLevel, LocationStatus, LocationType, Location
from util.serializers import BaseCreateSerializer
from util.validators import UniqueForActiveValidator, LocationParentChildValidator

### LOCATION LEVEL

class LocationLevelSerializer(serializers.ModelSerializer):

    id = serializers.UUIDField(read_only=False)

    class Meta:
        model = LocationLevel
        fields = ('id', 'name',)


class LocationLevelDetailSerializer(serializers.ModelSerializer):

    parents = LocationLevelSerializer(many=True)

    class Meta:
        model = LocationLevel
        fields = ('id', 'name', 'children', 'parents',)


class LocationLevelCreateSerializer(BaseCreateSerializer):

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

class LocationIdNameSerializer(BaseCreateSerializer):
    """Leaf node serializer for PersonDetailSerializer."""

    class Meta:
        model = Location
        fields = ('id', 'name')


class LocationSerializer(serializers.ModelSerializer):
    """Leaf node serializer for LocationDetailSerializer."""

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
        validators = [UniqueForActiveValidator(Location, 'number')]
        fields = ('id', 'name', 'number', 'status', 'location_level',)


class LocationUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Location
        validators = [
            UniqueForActiveValidator(Location, 'number'),
            LocationParentChildValidator('location_level', 'parents'),
            LocationParentChildValidator('location_level', 'children')
        ]
        fields = ('id', 'name', 'number', 'status', 'location_level',
            'parents', 'children',)
