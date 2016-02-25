from rest_framework.permissions import IsAuthenticated

from decision_tree.models import TreeData
from decision_tree.serializers import TreeDataListSerializer, TreeDataSerializer
from utils.views import BaseModelViewSet


class TreeDataViewSet(BaseModelViewSet):

    model = TreeData
    permission_classes = (IsAuthenticated,)
    queryset = TreeData.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return TreeDataListSerializer
        else:
            return TreeDataSerializer
