from rest_framework import serializers

from ticket.models import Ticket
from utils.serializers import BaseCreateSerializer
from category.serializers import CategoryIDNameSerializer
from person.serializers import PersonTicketSerializer
from location.serializers import LocationSerializer


TICKET_FIELDS = ('id', 'subject', 'number', 'request', 'status', 'priority', 
                'cc', 'assignee', 'requester', 'categories', 'location')


class TicketListSerializer(serializers.ModelSerializer):

    categories = CategoryIDNameSerializer(many=True)
    assignee = PersonTicketSerializer(required=False)
    location = LocationSerializer()

    class Meta:
        model = Ticket
        fields = ('id', 'subject', 'number', 'request', 'status', 
                'priority', 'assignee', 'categories', 'location')


class TicketSerializer(serializers.ModelSerializer):

    categories = CategoryIDNameSerializer(many=True)
    assignee = PersonTicketSerializer(required=False)
    requester = PersonTicketSerializer()
    cc = PersonTicketSerializer(many=True)
    location = LocationSerializer()

    class Meta:
        model = Ticket
        fields = TICKET_FIELDS


class TicketCreateSerializer(BaseCreateSerializer):

    class Meta:
        model = Ticket
        fields = TICKET_FIELDS
