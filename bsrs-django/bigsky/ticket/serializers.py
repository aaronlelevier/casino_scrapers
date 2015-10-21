from rest_framework import serializers

from ticket.models import Ticket
from utils.serializers import BaseCreateSerializer
from category.serializers import CategoryIDNameSerializer
from person.serializers import PersonListSerializer
from location.serializers import LocationSerializer


class TicketListSerializer(BaseCreateSerializer):

    categories = CategoryIDNameSerializer(required=True, many=True)
    assignee = PersonListSerializer(required=False)
    location = LocationSerializer()

    class Meta:
        model = Ticket
        fields = ('id', 'subject', 'number', 'request', 'status', 'priority', 'assignee', 'categories', 'location')


class TicketSerializer(BaseCreateSerializer):

    categories = CategoryIDNameSerializer(many=True)
    assignee = PersonListSerializer()
    requester = PersonListSerializer()
    cc = PersonListSerializer(many=True)
    location = LocationSerializer()

    class Meta:
        model = Ticket
        fields = ('id', 'subject', 'number', 'request', 'status', 'priority', 'cc', 'assignee', 'requester', 'categories', 'location')


class TicketCreateSerializer(BaseCreateSerializer):

    class Meta:
        model = Ticket
        fields = ('id', 'subject', 'number', 'request', 'status', 'priority', 'cc', 'assignee', 'requester', 'categories', 'location')
