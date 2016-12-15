from django.apps import apps

from rest_framework import serializers

from automation.serializers import AutomationIdDescriptionSerializer
from category.models import Category
from category.serializers import CategoryChildrenSerializer
from generic.serializers import Attachment
from location.serializers import LocationStatusFKSerializer, LocationTicketListSerializer
from person.serializers import PersonTicketSerializer, PersonTicketListSerializer
from person.serializers_leaf import PersonSimpleSerializer
from ticket.helpers import TicketActivityToRepresentation
from ticket.models import Ticket, TicketActivity, TicketPriority, TicketStatus
from utils.serializers import BaseCreateSerializer


TICKET_BASE_FIELDS = ('id', 'location', 'assignee',
    'requester', 'categories', 'request', 'completion_date', 'creator')

TICKET_FIELDS = TICKET_BASE_FIELDS + ('status', 'priority',)


class TicketPrioritySerializer(serializers.ModelSerializer):

    class Meta:
        model = TicketPriority
        fields = ('id', 'name')


class TicketStatusSerializer(serializers.ModelSerializer):

    class Meta:
        model = TicketStatus
        fields = ('id', 'name')


class TicketCreateUpdateSerializer(BaseCreateSerializer):

    attachments = serializers.PrimaryKeyRelatedField(
        queryset=Attachment.objects.all(), many=True, required=False)

    class Meta:
        model = Ticket
        fields = TICKET_FIELDS + ('cc', 'attachments', 'dt_path')

    def create(self, validated_data):
        validated_data.pop('attachments', None)
        instance = super(TicketCreateUpdateSerializer, self).create(validated_data)

        if instance.status.name == TicketStatus.NEW:
            self._process_ticket(instance)

        return instance

    def update(self, instance, validated_data):
        init_status = instance.status.name
        instance = super(TicketCreateUpdateSerializer, self).update(instance, validated_data)

        if init_status != instance.status.name and instance.status.name == TicketStatus.NEW:
            self._process_ticket(instance)

        return instance

    def _process_ticket(self, instance):
        if instance.status.name == TicketStatus.NEW:
            Automation = apps.get_model("automation", "automation")
            AutomationEvent = apps.get_model("automation", "automationevent")

            tenant_id = instance.location.location_level.tenant.id

            Automation.objects.process_ticket(tenant_id, ticket=instance,
                                              event=AutomationEvent.STATUS_NEW)


class TicketListSerializer(serializers.ModelSerializer):

    location = LocationTicketListSerializer()
    categories = CategoryChildrenSerializer(many=True)
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
    categories = CategoryChildrenSerializer(many=True)
    cc = PersonTicketSerializer(many=True)
    attachments = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    status_fk = serializers.PrimaryKeyRelatedField(queryset=TicketStatus.objects.all(),
                                                   source='status')
    priority_fk = serializers.PrimaryKeyRelatedField(queryset=TicketPriority.objects.all(),
                                                     source='priority')

    class Meta:
        model = Ticket
        fields = TICKET_BASE_FIELDS + ('number', 'cc', 'attachments', 'created', 'legacy_ref_number',
                                       'status_fk', 'priority_fk', 'dt_path')

    @staticmethod
    def eager_load(queryset):
        return (queryset.select_related('location', 'assignee', 'status',
                                        'priority')
                        .prefetch_related('cc', 'categories', 'attachments',
                                          'categories__children'))


class TicketActivitySerializer(serializers.ModelSerializer):

    person = PersonSimpleSerializer()
    automation = AutomationIdDescriptionSerializer()

    class Meta:
        model = TicketActivity
        fields = ('id', 'created', 'type', 'ticket', 'person', 'automation', 'content',)

    def to_representation(self, obj):
        """
        Handle different data structures based on TicketActivityType. These will be
        loaded as fixtures, so all TicketActivityType will be present here.
        """
        data = super(TicketActivitySerializer, self).to_representation(obj)

        activity_data = TicketActivityToRepresentation(data)
        data = activity_data.get_data()

        return data
