from rest_framework.permissions import IsAuthenticated

from ticket.models import Ticket
from ticket import serializers as ts
from utils.views import BaseModelViewSet


class TicketsViewSet(BaseModelViewSet):
    permission_classes = (IsAuthenticated,)
    queryset = Ticket.objects.all()
    # filter_fields = ['name']  

    def get_serializer_class(self):
        """
        set the serializer based on the method
        """
        return ts.TicketSerializer
