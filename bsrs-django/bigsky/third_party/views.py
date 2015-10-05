from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
import rest_framework_filters as filters

from third_party.models import ThirdParty
from third_party import serializers as cs


class ThirdPartyFilterSet(filters.FilterSet):
    name = filters.AllLookupsFilter(name='name')

    class Meta:
        model = ThirdParty
        fields = ['name']


class third_partyViewSet(viewsets.ModelViewSet):
    '''
    '''
    permission_classes = (IsAuthenticated,)
    queryset = ThirdParty.objects.all()
    filter_class = ThirdPartyFilterSet

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
