from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated

from ticket.mixins import CreateTicketModelMixin, UpdateTicketModelMixin
from ticket.models import Ticket, TicketActivity
from ticket.serializers import (TicketSerializer, TicketCreateSerializer,
    TicketListSerializer, TicketActivitySerializer)
from utils.views import BaseModelViewSet


class TicketViewSet(CreateTicketModelMixin, UpdateTicketModelMixin, BaseModelViewSet):

    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = (IsAuthenticated,)
    model = Ticket
    filter_fields = [f.name for f in model._meta.get_fields()]

    def get_serializer_class(self):
        """
        set the serializer based on the method
        """
        if self.action == 'list':
            return TicketListSerializer
        elif self.action in ('create', 'update', 'partial_update'):
            return TicketCreateSerializer
        else:
            return TicketSerializer


class TicketActivityViewSet(BaseModelViewSet):

    queryset = TicketActivity.objects.all()
    serializer_class = TicketActivitySerializer
    permission_classes = (IsAuthenticated,)
    model = TicketActivity
    filter_fields = [f.name for f in model._meta.get_fields()]

    def get_serializer_class(self):
        if self.action == 'list':
            return TicketActivitySerializer
        else:
            raise MethodNotAllowed

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        # custom: start
        pk = kwargs.get('pk', None)
        if pk:
            queryset = queryset.filter(ticket=pk)
        # custom: end
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
