from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from decision_tree.models import TreeData
from decision_tree.serializers import (TreeDataListSerializer, TreeDataDetailSerializer,
    TreeDataCreateUpdateSerializer,)
from ticket.models import Ticket
from ticket.serializers import TicketCreateSerializer
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


class DecisionTreeViewSet(BaseModelViewSet):
    """
    For use with the Decistion Tree, while the User is navigating the Tree.
    To send Create/Updates to a Ticket, and return the detail TreeData for the
    next node in the tree back to the User.

    :return: the `TreeDataDetailSerializer` representation from the (pk) in the URI.
    """

    queryset = Ticket.objects.all()
    serializer_class = TicketCreateSerializer
    permission_classes = (IsAuthenticated,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        # custom: return response with TreeData
        dt_serializer = self._get_tree_data(kwargs)
        return Response(dt_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self._get_ticket(request.data)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        # custom: return response with TreeData
        dt_serializer = self._get_tree_data(kwargs)
        return Response(dt_serializer.data)

    @staticmethod
    def _get_tree_data(kwargs):
        pk = kwargs.get('pk', None)
        tree_data = get_object_or_404(TreeData, pk=pk)
        return TreeDataDetailSerializer(tree_data)

    @staticmethod
    def _get_ticket(data):
        id = data.pop('id', None)
        return get_object_or_404(Ticket, id=id)
