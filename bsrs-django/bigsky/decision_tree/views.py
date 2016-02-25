from django.shortcuts import render

from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import MethodNotAllowed

from decision_tree.models import TreeField, TreeOption, TreeLink, TreeData
from decision_tree.serializers import (TreeFieldSerializer, TreeOptionSerializer,
    TreeLinkSerializer, TreeDataListSerializer, TreeDataSerializer)
from utils.views import BaseModelViewSet


class TreeFieldViewSet(BaseModelViewSet):

    model = TreeField
    permission_classes = (IsAuthenticated,)
    queryset = TreeField.objects.all()

    def get_serializer_class(self):
        if self.action in ('list', 'update'):
            raise MethodNotAllowed(method=self.action)
        else:
            return TreeFieldSerializer


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

    def get_serializer_class(self):
        if self.action == 'list':
            return TreeDataListSerializer
        elif self.action == 'update':
            raise MethodNotAllowed(method=self.action)
        else:
            return TreeDataSerializer
