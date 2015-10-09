from ticket.models import Ticket
from utils.serializers import BaseCreateSerializer


class TicketSerializer(BaseCreateSerializer):

    class Meta:
        model = Ticket
        fields = ('id', 'subject',)
