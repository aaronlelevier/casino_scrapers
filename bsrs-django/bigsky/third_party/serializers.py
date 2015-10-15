from category.serializers import CategoryIDNameSerializer
from contact.serializers import   (
    PhoneNumberFlatSerializer, PhoneNumberSerializer,
    EmailFlatSerializer, EmailSerializer,
    AddressFlatSerializer, AddressSerializer)
from third_party.models import ThirdParty
from utils.serializers import BaseCreateSerializer, NestedContactSerializerMixin


THIRD_PARTY_FIELDS = ('id', 'name', 'number', 'status',)


class ThirdPartySerializer(BaseCreateSerializer):

    class Meta:
        model = ThirdParty
        fields = THIRD_PARTY_FIELDS


class ThirdPartyCreateUpdateSerializer(NestedContactSerializerMixin, BaseCreateSerializer):

    categories = CategoryIDNameSerializer(many=True, read_only=True)
    emails = EmailFlatSerializer(required=False, many=True)
    phone_numbers = PhoneNumberFlatSerializer(required=False, many=True)
    addresses = AddressFlatSerializer(required=False, many=True)

    class Meta:
        model = ThirdParty
        fields = THIRD_PARTY_FIELDS + ('currency', 'categories',
            'emails', 'phone_numbers', 'addresses',)


class ThirdPartyDetailSerializer(ThirdPartyCreateUpdateSerializer):

    emails = EmailSerializer(required=False, many=True)
    phone_numbers = PhoneNumberSerializer(required=False, many=True)
    addresses = AddressSerializer(required=False, many=True)
