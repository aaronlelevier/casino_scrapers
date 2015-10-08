from third_party.models import ThirdParty
from utils.serializers import BaseCreateSerializer


### CONTRACTOR

CONTRACTOR_FIELDS = ('id', 'name', 'number', 'status',)


class ContractorListSerializer(BaseCreateSerializer):

    class Meta:
        model = ThirdParty
        fields = CATEGORY_FIELDS

class ContractorDetailSerializer(BaseCreateSerializer):

    class Meta:
        model = ThirdParty
        fields = CATEGORY_FIELDS
