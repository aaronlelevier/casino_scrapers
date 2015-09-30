from generic.models import SavedSearch
from util.serializers import BaseCreateSerializer
from util.validators import UniqueForActiveValidator

class SavedSearchSerializer(BaseCreateSerializer):

    class Meta:
        model = SavedSearch
        fields = ('id', 'name', 'endpoint_name', 'endpoint_uri')
