from rest_framework.permissions import IsAuthenticated

from ticket.models import Ticket
from ticket.serializers import TicketSerializer
from utils.views import BaseModelViewSet


class TicketsViewSet(BaseModelViewSet):

    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = (IsAuthenticated,)
