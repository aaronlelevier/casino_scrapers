from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from dtd.models import TreeData
from dtd.serializers import TreeDataDetailSerializer
from ticket.models import Ticket
from ticket.serializers import TicketCreateSerializer, TicketDTSerializer
from utils.views import BaseModelViewSet


class DTTicketViewSet(BaseModelViewSet):
    """
    **API Endpoint:**

      - POST/PATCH: `/api/tickets/{dt-id}/dt/`

        Create or Partial Update a Ticket.

        :return: the `TreeDataDetailSerializer` representation from the (pk) in the URI.

      - GET: `/api/tickets/{dt-id}/dt/?ticket={ticket-id}`

        Query a DTD by ID, and a Ticket by ID, and return them side by side.
        Ticket ID is optional.

        :return: `{'dtd': dtd, 'ticket': ticket}`
    """

    queryset = Ticket.objects.all()
    serializer_class = TicketCreateSerializer
    permission_classes = (IsAuthenticated,)

    def list(self, request, *args, **kwargs):
        dt_serializer = self._get_tree_data(kwargs)

        ticket_id = request.query_params.get('ticket', None)
        if ticket_id:
            ticket = self._get_ticket({'id': ticket_id})
            ticket_serializer = TicketDTSerializer(ticket)
            data = {
                'ticket': ticket_serializer.data,
                'dtd': dt_serializer.data
            }
            return Response(data)

        return Response(dt_serializer.data)

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
