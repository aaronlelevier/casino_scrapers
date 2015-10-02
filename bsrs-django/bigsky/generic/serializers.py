from generic.models import SavedSearch
from utils.serializers import BaseCreateSerializer
from utils.validators import UniqueForActiveValidator

class SavedSearchSerializer(BaseCreateSerializer):

    class Meta:
        model = SavedSearch
        fields = ('id', 'name', 'endpoint_name', 'endpoint_uri')
