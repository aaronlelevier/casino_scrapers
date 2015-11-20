from rest_framework import serializers

from category.models import Category
from contact.serializers import   (
    PhoneNumberFlatSerializer, PhoneNumberSerializer,
    EmailFlatSerializer, EmailSerializer,
    AddressFlatSerializer, AddressSerializer)
from third_party.models import ThirdParty
from utils.serializers import BaseCreateSerializer, NestedContactSerializerMixin



THIRD_PARTY_FIELDS = ('id', 'name', 'number', 'status',)


class ThirdPartySerializer(serializers.ModelSerializer):

    class Meta:
        model = ThirdParty
        fields = THIRD_PARTY_FIELDS


class ThirdPartyCreateSerializer(BaseCreateSerializer):

    class Meta:
        model = ThirdParty
        fields = THIRD_PARTY_FIELDS + ('currency',)


class ThirdPartyUpdateSerializer(NestedContactSerializerMixin, serializers.ModelSerializer):
    """
    Has the ability to create nested Contacts, but not nested Categories. 
    Only update related categories on the ThirdParty.
    """
    categories = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), many=True, required=False)
    emails = EmailFlatSerializer(required=False, many=True)
    phone_numbers = PhoneNumberFlatSerializer(required=False, many=True)
    addresses = AddressFlatSerializer(required=False, many=True)

    class Meta:
        model = ThirdParty
        fields = THIRD_PARTY_FIELDS + ('currency', 'categories',
            'emails', 'phone_numbers', 'addresses',)


class ThirdPartyDetailSerializer(serializers.ModelSerializer):

    emails = EmailSerializer(required=False, many=True)
    phone_numbers = PhoneNumberSerializer(required=False, many=True)
    addresses = AddressSerializer(required=False, many=True)

    class Meta:
        model = ThirdParty
        fields = THIRD_PARTY_FIELDS + ('emails', 'phone_numbers', 'addresses',)
