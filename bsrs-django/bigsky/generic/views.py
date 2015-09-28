from rest_framework.permissions import IsAuthenticated

from generic.models import SavedSearch
from generic.serializers import SavedSearchSerializer
from util.views import BaseModelViewSet


class SavedSearchViewSet(BaseModelViewSet):
    
    permission_classes = (IsAuthenticated,)
    serializer_class = SavedSearchSerializer
    queryset = SavedSearch.objects.all()
