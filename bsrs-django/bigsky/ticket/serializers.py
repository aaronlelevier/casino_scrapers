from rest_framework import serializers

from ticket.models import Ticket, TicketActivity
from utils.serializers import BaseCreateSerializer
from category.serializers import CategoryIDNameSerializer
from person.serializers import PersonTicketSerializer
from location.serializers import LocationSerializer


TICKET_FIELDS = ('id', 'location', 'status', 'priority', 'assignee', 'cc',
    'requester', 'categories', 'attachments', 'request',)


class TicketListSerializer(serializers.ModelSerializer):

    categories = CategoryIDNameSerializer(many=True)
    assignee = PersonTicketSerializer(required=False)
    location = LocationSerializer()

    class Meta:
        model = Ticket
        fields = TICKET_FIELDS + ('number',)


class TicketSerializer(serializers.ModelSerializer):

    categories = CategoryIDNameSerializer(many=True)
    assignee = PersonTicketSerializer(required=False)
    requester = PersonTicketSerializer()
    cc = PersonTicketSerializer(many=True)
    location = LocationSerializer()

    class Meta:
        model = Ticket
        fields = TICKET_FIELDS + ('number',)


class TicketCreateSerializer(BaseCreateSerializer):

    class Meta:
        model = Ticket
        fields = TICKET_FIELDS


class TicketActivitySerializer(serializers.ModelSerializer):

    class Meta:
        model = TicketActivity
        fields = ('id', 'created', 'type', 'ticket', 'person', 'comment',)
