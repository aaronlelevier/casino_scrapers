from rest_framework import serializers

from category.serializers import CategoryIDNameSerializer
from location.serializers import LocationSerializer
from person.serializers import PersonTicketSerializer
from ticket.models import Ticket, TicketActivity, TicketActivityType
from utils.serializers import BaseCreateSerializer


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

    def to_representation(self, obj):
        obj = super(TicketCreateSerializer, self).to_representation(obj)
        return dict(obj)


class TicketActivitySerializer(serializers.ModelSerializer):

    class Meta:
        model = TicketActivity
        fields = ('id', 'created', 'type', 'ticket', 'person', 'content',)
