from rest_framework import serializers

from contact.serializers import   (
    PhoneNumberFlatSerializer, PhoneNumberSerializer,
    EmailFlatSerializer, EmailSerializer,
    AddressFlatSerializer, AddressSerializer)
from location.models import LocationLevel, LocationStatus, LocationType, Location
from location.validators import LocationParentChildValidator
from person.serializers_leaf import PersonSimpleSerializer
from utils.serializers import BaseCreateSerializer, NestedContactSerializerMixin
from utils.validators import UniqueForActiveValidator


### LOCATION LEVEL

LOCATION_LEVEL_BASE_DETAIL_FIELDS = ('id', 'name', 'contact', 'can_create_tickets',
    'landlord', 'warranty', 'catalog_categories', 'assets',)


class LocationLevelSerializer(serializers.ModelSerializer):

    id = serializers.UUIDField(read_only=False)

    class Meta:
        model = LocationLevel
        fields = ('id', 'name',)


class LocationLevelDetailSerializer(serializers.ModelSerializer):

    class Meta:
        model = LocationLevel
        fields = LOCATION_LEVEL_BASE_DETAIL_FIELDS + \
            ('children', 'parents',)


class LocationLevelCreateSerializer(BaseCreateSerializer):

    class Meta:
        model = LocationLevel
        fields = LOCATION_LEVEL_BASE_DETAIL_FIELDS + ('children',)


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

class LocationIdNameOnlySerializer(serializers.ModelSerializer):
    """Leaf node serializer for Person-Current Bootstrapped data."""

    class Meta:
        model = Location
        fields = ('id', 'name',)


class LocationIdNameSerializer(BaseCreateSerializer):
    """Leaf node serializer for PersonDetailSerializer."""

    location_level = LocationLevelSerializer()

    class Meta:
        model = Location
        fields = ('id', 'name', 'number', 'location_level')


class LocationSerializer(serializers.ModelSerializer):
    """Leaf node serializer for LocationDetailSerializer."""

    class Meta:
        model = Location
        fields = ('id', 'name', 'number', 'location_level',)

        
class LocationListSerializer(serializers.ModelSerializer):
    #TODO: why does this have to be the full object? remove
    location_level = LocationLevelSerializer()
    
    class Meta:
        model = Location
        fields = ('id', 'name', 'number', 'status', 'location_level',)


class LocationDetailSerializer(serializers.ModelSerializer):
    
    people = PersonSimpleSerializer(many=True)
    parents = LocationSerializer(many=True)
    children = LocationSerializer(many=True)
    emails = EmailSerializer(required=False, many=True)
    phone_numbers = PhoneNumberSerializer(required=False, many=True)
    addresses = AddressSerializer(required=False, many=True)

    class Meta:
        model = Location
        fields = ('id', 'name', 'number', 'location_level', 'status', 'people',
            'parents', 'children', 'emails', 'phone_numbers', 'addresses',)


class LocationCreateSerializer(BaseCreateSerializer):

    class Meta:
        model = Location
        validators = [UniqueForActiveValidator(Location, ['number'])]
        fields = ('id', 'name', 'number', 'status', 'location_level',)


class LocationUpdateSerializer(NestedContactSerializerMixin, serializers.ModelSerializer):

    emails = EmailFlatSerializer(required=False, many=True)
    phone_numbers = PhoneNumberFlatSerializer(required=False, many=True)
    addresses = AddressFlatSerializer(required=False, many=True)

    class Meta:
        model = Location
        validators = [
            UniqueForActiveValidator(Location, ['number']),
            LocationParentChildValidator('location_level', 'parents'),
            LocationParentChildValidator('location_level', 'children')
        ]
        fields = ('id', 'name', 'number', 'status', 'location_level',
            'parents', 'children', 'emails', 'phone_numbers', 'addresses',)
