from generic.models import SavedSearch
from util.serializers import BaseCreateSerializer
from util.validators import UniqueForActiveValidator

class SavedSearchSerializer(BaseCreateSerializer):

    class Meta:
        model = SavedSearch
        validators = [UniqueForActiveValidator(SavedSearch, ['person', 'name'])]
        fields = ('id', 'name', 'person', 'endpoint_name', 'endpoint_uri')
