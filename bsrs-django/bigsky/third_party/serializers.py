from category.serializers import CategoryIDNameSerializer
from contact.serializers import   (
    PhoneNumberFlatSerializer, PhoneNumberSerializer,
    EmailFlatSerializer, EmailSerializer,
    AddressFlatSerializer, AddressSerializer)
from third_party.models import ThirdParty
from utils.serializers import BaseCreateSerializer


THIRD_PARTY_FIELDS = ('id', 'name', 'number', 'status',)


class ThirdPartyListSerializer(BaseCreateSerializer):

    class Meta:
        model = ThirdParty
        fields = THIRD_PARTY_FIELDS


class ThirdPartyCreateUpdateSerializer(BaseCreateSerializer):

    categories = CategoryIDNameSerializer(many=True, read_only=True)
    phone_numbers = PhoneNumberFlatSerializer(many=True, read_only=True)
    addresses = AddressFlatSerializer(many=True, read_only=True)
    emails = EmailFlatSerializer(many=True, read_only=True)

    class Meta:
        model = ThirdParty
        fields = THIRD_PARTY_FIELDS + ('currency', 'categories',
            'emails', 'phone_numbers', 'addresses',)


class ThirdPartyDetailSerializer(ThirdPartyCreateUpdateSerializer):

    phone_numbers = PhoneNumberSerializer(many=True)
    addresses = AddressSerializer(many=True)
    emails = EmailSerializer(many=True)


class ThirdPartySerializer(BaseCreateSerializer):

    class Meta:
        model = ThirdParty
        fields = THIRD_PARTY_FIELDS
