from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import list_route

from dtd.models import TreeData
from dtd.serializers import TreeDataDetailSerializer
from ticket.models import Ticket
from ticket.serializers import TicketCreateUpdateSerializer, TicketSerializer
from utils.views import BaseModelViewSet


class DTTicketViewSet(BaseModelViewSet):
    """
    **API Endpoint:**

      - GET: `/api/dt/dt-start/`

      - GET: `/api/dt/{dt-id}/ticket/?ticket={ticket-id}`

        Query a DTD by ID, and a Ticket by ID, and return them side by side.
        Ticket ID is optional.

        :return: `{'dtd': dtd, 'ticket': ticket}`

      - POST: `/api/dt/ticket/`

        :return: the `TreeDataDetailSerializer` representation for the 'Start' DTD.

      - POST/PATCH: `/api/dt/{dt-id}/ticket/`

        :return: the `TreeDataDetailSerializer` representation from the (pk) in the URI.
    """

    queryset = Ticket.objects.all()
    serializer_class = TicketCreateUpdateSerializer
    permission_classes = (IsAuthenticated,)

    def list(self, request, *args, **kwargs):
        dt_serializer = self._get_tree_data(kwargs)

        ticket_id = request.query_params.get('ticket', None)
        if ticket_id:
            ticket = self._get_ticket({'id': ticket_id})
            ticket_serializer = TicketSerializer(ticket)
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
        id = data.get('id', None)
        return get_object_or_404(Ticket, id=id)

    @list_route()
    def dt_start(self, request):
        tree_data = TreeData.objects.get_start()
        dt_serializer = TreeDataDetailSerializer(tree_data)
        return Response(dt_serializer.data)

    @list_route(methods=['PATCH'], url_path=r"submit")
    def submit(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self._get_ticket(request.data)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
