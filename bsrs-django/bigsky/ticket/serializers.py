from rest_framework import serializers

from category.serializers import CategoryIDNameSerializerTicket
from generic.serializers import Attachment
from location.serializers import LocationSerializer, LocationTicketSerializer
from person.serializers import PersonTicketSerializer
from person.serializers_leaf import PersonSimpleSerializer
from ticket.helpers import TicketActivityToRepresentation
from ticket.models import Ticket, TicketActivity, TicketPriority, TicketStatus
from utils.serializers import BaseCreateSerializer


TICKET_FIELDS = ('id', 'location', 'status', 'priority', 'assignee',
    'requester', 'categories', 'request')


class TicketPrioritySerializer(serializers.ModelSerializer):

    class Meta:
        model = TicketPriority
        fields = ('id', 'name')


class TicketStatusSerializer(serializers.ModelSerializer):

    class Meta:
        model = TicketStatus
        fields = ('id', 'name')

class TicketCreateSerializer(BaseCreateSerializer):

    status = serializers.PrimaryKeyRelatedField(
        queryset=TicketStatus.objects.all(), required=True)
    priority = serializers.PrimaryKeyRelatedField(
        queryset=TicketPriority.objects.all(), required=True)
    attachments = serializers.PrimaryKeyRelatedField(
        queryset=Attachment.objects.all(), many=True, required=False)

    class Meta:
        model = Ticket
        fields = TICKET_FIELDS + ('cc', 'attachments')


class TicketListSerializer(serializers.ModelSerializer):

    location = LocationTicketSerializer()
    categories = CategoryIDNameSerializerTicket(many=True)
    assignee = PersonTicketSerializer(required=False)
    status = TicketStatusSerializer(required=False)
    priority = TicketPrioritySerializer(required=False)

    class Meta:
        model = Ticket
        fields = TICKET_FIELDS + ('number', 'created',)

    @staticmethod
    def eager_load(queryset):
        return (queryset.select_related('location', 'assignee', 'status',
                                        'priority')
                        .prefetch_related('categories', 'categories__children'))


class TicketSerializer(serializers.ModelSerializer):

    location = LocationTicketSerializer()
    assignee = PersonTicketSerializer(required=False)
    categories = CategoryIDNameSerializerTicket(many=True)
    cc = PersonTicketSerializer(many=True)

    class Meta:
        model = Ticket
        fields = TICKET_FIELDS + ('number', 'cc', 'attachments', 'created')

    @staticmethod
    def eager_load(queryset):
        return (queryset.select_related('location', 'assignee', 'status',
                                        'priority')
                        .prefetch_related('cc', 'categories', 'attachments',
                                          'categories__children'))

    def to_representation(self, obj):
        data = super(TicketSerializer, self).to_representation(obj)
        data['status_fk'] = data.pop('status', [])
        data['priority_fk'] = data.pop('priority', [])
        return data

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

        activity_data = TicketActivityToRepresentation(data)
        data = activity_data.get_data()

        return data
