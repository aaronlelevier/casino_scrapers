from category.serializers import CategoryIDNameSerializer
from contact.serializers import   (
    PhoneNumberFlatSerializer, PhoneNumberSerializer,
    EmailFlatSerializer, EmailSerializer,
    AddressFlatSerializer, AddressSerializer)
from third_party.models import ThirdParty
from utils.serializers import BaseCreateSerializer

from rest_framework import serializers


THIRD_PARTY_FIELDS = ('id', 'name', 'number', 'status',)


class ThirdPartySerializer(serializers.ModelSerializer):

    class Meta:
        model = ThirdParty
        fields = THIRD_PARTY_FIELDS


class ThirdPartyCreateUpdateSerializer(BaseCreateSerializer):

    categories = CategoryIDNameSerializer(read_only=True, many=True)
    emails = EmailFlatSerializer(read_only=True, many=True)
    phone_numbers = PhoneNumberFlatSerializer(read_only=True, many=True)
    addresses = AddressFlatSerializer(read_only=True, many=True)

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
