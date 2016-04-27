from rest_framework.permissions import IsAuthenticated

from dtd.models import TreeData
from dtd.serializers import (TreeDataListSerializer, TreeDataDetailSerializer,
    TreeDataCreateUpdateSerializer,)
from utils.mixins import SearchMultiMixin
from utils.views import BaseModelViewSet


class TreeDataViewSet(SearchMultiMixin, BaseModelViewSet):

    model = TreeData
    permission_classes = (IsAuthenticated,)
    queryset = TreeData.objects.all()
    filter_fields = [f.name for f in model._meta.get_fields()]

    def get_serializer_class(self):
        if self.action == 'list':
            return TreeDataListSerializer
        elif self.action == 'retrieve':
            return TreeDataDetailSerializer
        else:
            return TreeDataCreateUpdateSerializer
