from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from dtd.models import TreeData
from dtd.serializers import (TreeDataListSerializer, TreeDataDetailSerializer,
    TreeDataCreateUpdateSerializer,)
from ticket.models import Ticket
from ticket.serializers import TicketCreateSerializer
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
