import copy

from rest_framework import serializers

from category.models import Category
from category.serializers import CategoryIDNameSerializer
from location.serializers import LocationSerializer
from person.models import Person
from person.serializers import PersonSimpleSerializer, PersonTicketSerializer
from ticket.helpers import TicketActivityToRepresentation
from ticket.models import (Ticket, TicketStatus, TicketPriority, TicketActivity,
    TicketActivityType)
from utils.serializers import BaseCreateSerializer


TICKET_FIELDS = ('id', 'location', 'status', 'priority', 'assignee',
    'requester', 'categories', 'attachments', 'request',)


class TicketCreateSerializer(BaseCreateSerializer):

    class Meta:
        model = Ticket
        fields = TICKET_FIELDS + ('cc', )


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
    location = LocationSerializer()
    requester = PersonTicketSerializer()
    cc = PersonTicketSerializer(many=True)

    class Meta:
        model = Ticket
        fields = TICKET_FIELDS + ('number', 'cc',)


class TicketActivitySerializer(serializers.ModelSerializer):

    person = PersonSimpleSerializer()

    class Meta:
        model = TicketActivity
        fields = ('id', 'created', 'type', 'ticket', 'person', 'content',)

    def to_representation(self, obj):
        """
        Handle different data structures based on TicketActivityType. These will be
        loaded as fixtures, so all TicketActivityType will be present here.
        """
        data = super(TicketActivitySerializer, self).to_representation(obj)

        if data['content']:
            activity_data = TicketActivityToRepresentation(data)
            data = activity_data.get_data()

        return data
