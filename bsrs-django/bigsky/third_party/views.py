from rest_framework.permissions import IsAuthenticated

from third_party.models import ThirdParty
from third_party.serializers import (ThirdPartySerializer, ThirdPartyDetailSerializer,
    ThirdPartyCreateSerializer, ThirdPartyUpdateSerializer)
from utils.views import BaseModelViewSet


class ThirdPartyViewSet(BaseModelViewSet):

    model = ThirdParty
    permission_classes = (IsAuthenticated,)
    queryset = ThirdParty.objects.all()
    filter_fields = [f.name for f in model._meta.get_fields()]

    def get_serializer_class(self):
        """
        set the serializer based on the method
        """
        if self.action == 'create':
            return ThirdPartyCreateSerializer
        elif self.action in ('update', 'partial_update'):
            return ThirdPartyUpdateSerializer
        elif self.action == 'retrieve':
            return ThirdPartyDetailSerializer
        else:
            return ThirdPartySerializer
