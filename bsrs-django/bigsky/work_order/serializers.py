from rest_framework import serializers
from work_order.models import WorkOrder
from location.serializers import LocationSerializer
from person.serializers import PersonTicketSerializer
from utils.serializers import BaseCreateSerializer


WO_FIELDS = ('id', 'approver', 'assignee', 'category', 'completed_date',
    'cost_estimate', 'cost_estimate_currency', 'expiration_date', 'instructions',
    'location', 'priority', 'provider', 'requester', 'status', 'scheduled_date')


class WorkOrderListSerializer(serializers.ModelSerializer):

    location = LocationSerializer()
    assignee = PersonTicketSerializer(required=False)

    class Meta: 
        model = WorkOrder
        fields = WO_FIELDS


class WorkOrderSerializer(serializers.ModelSerializer):

    class Meta: 
        model = WorkOrder
        fields = WO_FIELDS


class WorkOrderCreateSerializer(BaseCreateSerializer):

    class Meta: 
        model = WorkOrder
        fields = WO_FIELDS
