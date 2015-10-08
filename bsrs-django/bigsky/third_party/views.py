from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
import rest_framework_filters as filters

from third_party.models import ThirdParty
from third_party import serializers as cs
from utils.views import BaseModelViewSet


class third_partyViewSet(BaseModelViewSet):
    '''
    '''
    permission_classes = (IsAuthenticated,)
    queryset = ThirdParty.objects.all()
    model = ThirdParty
    filter_fields = [f.name for f in model._meta.get_fields()]

    def get_serializer_class(self):
        """
        set the serializer based on the method
        """
        if self.action == 'list':
            return cs.ThirdPartyListSerializer
        elif self.action == 'retrieve':
            return cs.ThirdPartyDetailSerializer
        else:
            return cs.ThirdPartySerializer
