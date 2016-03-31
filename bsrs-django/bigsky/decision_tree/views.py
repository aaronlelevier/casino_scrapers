from rest_framework.permissions import IsAuthenticated

from decision_tree.models import TreeData
from decision_tree.serializers import (TreeDataListSerializer, TreeDataDetailSerializer,
    TreeDataCreateUpdateSerializer,)
from utils.views import BaseModelViewSet


class TreeDataViewSet(BaseModelViewSet):

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

    def get_queryset(self):

        queryset = super(TreeDataViewSet, self).get_queryset();
    
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.search_multi(keyword=search)

        return queryset
