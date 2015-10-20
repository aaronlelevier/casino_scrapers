from ticket.models import Ticket
from utils.serializers import BaseCreateSerializer
from category.serializers import CategoryIDNameSerializer


class TicketSerializer(BaseCreateSerializer):

    categories = CategoryIDNameSerializer(many=True)

    class Meta:
        model = Ticket
        fields = ('id', 'subject', 'number', 'request', 'status', 'priority', 'assignee', 'categories', 'location')
