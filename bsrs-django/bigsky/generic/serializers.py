from generic.models import SavedSearch
from util.serializers import BaseCreateSerializer


class SavedSearchSerializer(BaseCreateSerializer):

    class Meta:
        model = SavedSearch
        fields = ('id', 'name', 'person', 'model_id', 'endpoint')
