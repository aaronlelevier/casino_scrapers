from django.shortcuts import render

from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import MethodNotAllowed

from decision_tree.models import TreeOption, TreeLink, TreeData
from decision_tree.serializers import (TreeOptionSerializer, TreeLinkSerializer,
    TreeDataSerializer,)
from utils.views import BaseModelViewSet


class TreeOptionViewSet(BaseModelViewSet):

    model = TreeOption
    permission_classes = (IsAuthenticated,)
    queryset = TreeOption.objects.all()
    serializer_class = TreeOptionSerializer


class TreeLinkViewSet(BaseModelViewSet):

    model = TreeLink
    permission_classes = (IsAuthenticated,)
    queryset = TreeLink.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'update':
            raise MethodNotAllowed(method=self.action)
        else:
            return TreeLinkSerializer


class TreeDataViewSet(BaseModelViewSet):

    model = TreeData
    permission_classes = (IsAuthenticated,)
    queryset = TreeData.objects.all()
    serializer_class = TreeDataSerializer
