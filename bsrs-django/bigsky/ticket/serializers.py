from rest_framework import serializers

from category.models import Category
from category.serializers import CategoryIDNameSerializer
from generic.serializers import Attachment
from location.serializers import LocationStatusFKSerializer, LocationTicketListSerializer
from person.serializers import PersonTicketSerializer, PersonTicketListSerializer
from person.serializers_leaf import PersonSimpleSerializer
from ticket.helpers import TicketActivityToRepresentation
from ticket.models import Ticket, TicketActivity, TicketPriority, TicketStatus
from utils.serializers import BaseCreateSerializer


TICKET_FIELDS = ('id', 'location', 'status', 'priority', 'assignee',
    'requester', 'categories', 'request', 'completion_date', 'creator')


class TicketPrioritySerializer(serializers.ModelSerializer):

    class Meta:
        model = TicketPriority
        fields = ('id', 'name')


class TicketStatusSerializer(serializers.ModelSerializer):

    class Meta:
        model = TicketStatus
        fields = ('id', 'name')


class TicketCreateSerializer(BaseCreateSerializer):

    attachments = serializers.PrimaryKeyRelatedField(
        queryset=Attachment.objects.all(), many=True, required=False)

    class Meta:
        model = Ticket
        fields = TICKET_FIELDS + ('cc', 'attachments', 'dt_path')

    def create(self, validated_data):
        validated_data.pop('attachments', None)
        return super(TicketCreateSerializer, self).create(validated_data)


class TicketListSerializer(serializers.ModelSerializer):

    location = LocationTicketListSerializer()
    categories = CategoryIDNameSerializer(many=True)
    category_ids = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='categories',
        many=True, required=False)
    assignee = PersonTicketListSerializer(required=False)
    status = TicketStatusSerializer(required=False)
    priority = TicketPrioritySerializer(required=False)

    class Meta:
        model = Ticket
        fields = TICKET_FIELDS + ('number', 'created', 'category_ids')

    @staticmethod
    def eager_load(queryset):
        return (queryset.select_related('location', 'assignee', 'status',
                                        'priority')
                        .prefetch_related('categories', 'categories__children'))


class TicketSerializer(serializers.ModelSerializer):

    location = LocationStatusFKSerializer()
    assignee = PersonTicketSerializer(required=False)
    categories = CategoryIDNameSerializer(many=True)
    cc = PersonTicketSerializer(many=True)
    attachments = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Ticket
        fields = TICKET_FIELDS + ('number', 'cc', 'attachments', 'created',
                                  'legacy_ref_number', 'dt_path')

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
