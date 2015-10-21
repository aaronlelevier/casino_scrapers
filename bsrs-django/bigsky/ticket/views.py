from rest_framework.permissions import IsAuthenticated

from ticket.models import Ticket
from ticket.serializers import TicketSerializer, TicketCreateSerializer, TicketListSerializer
from utils.views import BaseModelViewSet
from ticket import serializers as ts


class TicketsViewSet(BaseModelViewSet):

    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        """
        set the serializer based on the method
        """
        if self.action == 'list':
            return ts.TicketListSerializer
        elif self.action == ('create' or 'update' or 'partial_update'):
            return ts.TicketCreateSerializer
        else:
            return ts.TicketSerializer
