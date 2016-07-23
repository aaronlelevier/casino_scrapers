from rest_framework import serializers

from contact.serializers import (PhoneNumberSerializer, EmailSerializer, AddressSerializer)
from location.models import LocationLevel, LocationStatus, LocationType, Location
from location.validators import LocationParentChildValidator
from person.serializers_leaf import PersonSimpleSerializer
from utils.serializers import BaseCreateSerializer, NestedContactSerializerMixin, NestedCreateContactSerializerMixin
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

class LocationStatusSerializer(serializers.ModelSerializer):

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


class LocationSerializer(serializers.ModelSerializer):
    """Leaf node serializer for LocationDetailSerializer and PersonDetailSerializer"""

    class Meta:
        model = Location
        fields = ('id', 'name', 'number', 'location_level', 'status')


class LocationTicketListSerializer(serializers.ModelSerializer):
    """Leaf node serializer for LocationDetailSerializer and PersonDetailSerializer"""

    class Meta:
        model = Location
        fields = ('id', 'name', 'number')

class LocationStatusFKSerializer(serializers.ModelSerializer):
    """Leaf node serializer for LocationDetailSerializer and PersonDetailSerializer"""
    status_fk = serializers.PrimaryKeyRelatedField(queryset=LocationStatus.objects.all(), source='status')

    class Meta:
        model = Location
        fields = ('id', 'name', 'number', 'location_level', 'status_fk')


class LocationListSerializer(serializers.ModelSerializer):

    status = LocationStatusSerializer(required=False)

    class Meta:
        model = Location
        fields = ('id', 'name', 'number', 'status', 'location_level',)


class LocationSearchSerializer(serializers.ModelSerializer):

    # Addresses for power select component
    addresses = AddressSerializer(required=False, many=True)

    class Meta:
        model = Location
        fields = ('id', 'name', 'number', 'addresses', 'location_level')


class LocationDetailSerializer(serializers.ModelSerializer):

    people = PersonSimpleSerializer(many=True)
    parents = LocationSerializer(many=True)
    children = LocationSerializer(many=True)
    emails = EmailSerializer(required=False, many=True)
    phone_numbers = PhoneNumberSerializer(required=False, many=True)
    addresses = AddressSerializer(required=False, many=True)
    status_fk = serializers.PrimaryKeyRelatedField(queryset=LocationStatus.objects.all(), source='status')

    class Meta:
        model = Location
        fields = ('id', 'name', 'number', 'location_level', 'status_fk', 'people',
            'parents', 'children', 'emails', 'phone_numbers', 'addresses',)


class LocationUpdateSerializer(NestedCreateContactSerializerMixin, NestedContactSerializerMixin,
    serializers.ModelSerializer):

    emails = EmailSerializer(required=False, many=True)
    phone_numbers = PhoneNumberSerializer(required=False, many=True)
    addresses = AddressSerializer(required=False, many=True)

    class Meta:
        model = Location
        validators = [
            UniqueForActiveValidator(Location, ['number']),
            LocationParentChildValidator('parents'),
            LocationParentChildValidator('children')
        ]
        fields = ('id', 'name', 'number', 'status', 'location_level',
            'parents', 'children', 'emails', 'phone_numbers', 'addresses',)
