from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from third_party.models import ThirdParty
from third_party import serializers as tps
from utils.views import BaseModelViewSet


class ThirdPartyViewSet(BaseModelViewSet):
    permission_classes = (IsAuthenticated,)
    queryset = ThirdParty.objects.all()
    model = ThirdParty
    filter_fields = [f.name for f in model._meta.get_fields()]

    def get_serializer_class(self):
        """
        set the serializer based on the method
        """
        if self.action == 'list':
            return tps.ThirdPartyListSerializer
        elif self.action == 'retrieve':
            return tps.ThirdPartyDetailSerializer
        else:
            return tps.ThirdPartySerializer
