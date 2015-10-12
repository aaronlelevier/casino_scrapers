from ticket.models import Ticket
from utils.serializers import BaseCreateSerializer


### TICKET

TICKET_FIELDS = ('id', 'subject', 'number', 'request', 'status', 'priority', 'assignee')

class TicketSerializer(BaseCreateSerializer):

    class Meta:
        model = Ticket
        fields = TICKET_FIELDS
