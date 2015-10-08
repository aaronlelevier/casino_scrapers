from third_party.models import ThirdParty
from utils.serializers import BaseCreateSerializer


### CONTRACTOR

THIRD_PARTY_FIELDS = ('id', 'name', 'number', 'status',)

class ThirdPartySerializer(BaseCreateSerializer):

    class Meta:
        model = ThirdParty
        fields = THIRD_PARTY_FIELDS

class ThirdPartyListSerializer(BaseCreateSerializer):

    class Meta:
        model = ThirdParty
        fields = THIRD_PARTY_FIELDS

class ThirdPartyDetailSerializer(BaseCreateSerializer):

    class Meta:
        model = ThirdParty
        fields = THIRD_PARTY_FIELDS
