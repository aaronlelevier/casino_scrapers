from rest_framework import serializers

from category.models import Category
from contact.serializers import (PhoneNumberSerializer, EmailSerializer, AddressSerializer,
    AddressUpdateSerializer)
from third_party.models import ThirdParty, ThirdPartyStatus
from utils.serializers import BaseCreateSerializer, NestedContactSerializerMixin



THIRD_PARTY_FIELDS = ('id', 'name', 'number',)

THIRD_PARTY_FIELDS_WITH_STATUS = THIRD_PARTY_FIELDS + ('status',)

class ThirdPartyStatusSerializer(serializers.ModelSerializer):

    class Meta:
        model = ThirdPartyStatus
        fields = ('id', 'name')

class ThirdPartySerializer(serializers.ModelSerializer):

    status = ThirdPartyStatusSerializer(required=False)

    class Meta:
        model = ThirdParty
        fields = THIRD_PARTY_FIELDS_WITH_STATUS


class ThirdPartyCreateSerializer(BaseCreateSerializer):

    class Meta:
        model = ThirdParty
        fields = THIRD_PARTY_FIELDS_WITH_STATUS + ('currency',)


class ThirdPartyUpdateSerializer(NestedContactSerializerMixin, serializers.ModelSerializer):
    """
    Has the ability to create nested Contacts, but not nested Categories. 
    Only update related categories on the ThirdParty.
    """
    categories = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), many=True, required=False)
    emails = EmailSerializer(required=False, many=True)
    phone_numbers = PhoneNumberSerializer(required=False, many=True)
    addresses = AddressUpdateSerializer(required=False, many=True)

    class Meta:
        model = ThirdParty
        fields = THIRD_PARTY_FIELDS_WITH_STATUS + ('currency', 'categories',
            'emails', 'phone_numbers', 'addresses',)


class ThirdPartyDetailSerializer(serializers.ModelSerializer):

    emails = EmailSerializer(required=False, many=True)
    phone_numbers = PhoneNumberSerializer(required=False, many=True)
    addresses = AddressSerializer(required=False, many=True)
    status_fk = serializers.PrimaryKeyRelatedField(queryset=ThirdPartyStatus.objects.all(),
                                                   source='status')

    class Meta:
        model = ThirdParty
        fields = THIRD_PARTY_FIELDS + ('status_fk', 'emails', 'phone_numbers', 'addresses',)

    @staticmethod
    def eager_load(queryset):
        return queryset.prefetch_related('categories', 'emails', 'phone_numbers', 'addresses')
