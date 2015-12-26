from rest_framework import serializers
from work_order.models import WorkOrder
from location.serializers import LocationSerializer
from person.serializers import PersonTicketSerializer
from utils.serializers import BaseCreateSerializer


WO_FIELDS = ('id', 'location', 'status', 'priority', 'assignee',
    'requester', 'date_due')


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
