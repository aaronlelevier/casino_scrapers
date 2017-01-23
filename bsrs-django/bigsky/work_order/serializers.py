from rest_framework import serializers

from accounting.serializers import CurrencyIdNameSerializer
from location.serializers import LocationSerializer
from person.serializers import PersonTicketSerializer
from work_order.models import WorkOrder
from sc.etl import WorkOrderEtlDataAdapter
from utils.serializers import BaseCreateSerializer
from utils.validators import gte_today


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


class WorkOrderUpdateSerializer(BaseCreateSerializer):

    class Meta: 
        model = WorkOrder
        fields = WO_FIELDS


class WorkOrderCreateSerializer(BaseCreateSerializer):

    scheduled_date = serializers.DateTimeField(validators=[gte_today])

    class Meta:
        model = WorkOrder
        fields = ('id', 'category', 'provider', 'location', 'scheduled_date',
                  'approved_amount', 'cost_estimate', 'cost_estimate_currency')

    def create(self, validated_data):
        """
        Synchronously create the WorkOrder in SC before creating in BS.
        """
        scid = WorkOrderEtlDataAdapter(validated_data).post()

        instance = super(WorkOrderCreateSerializer, self).create(validated_data)

        instance.scid = scid
        instance.save()
        return instance


class WorkOrderLeafSerializer(serializers.ModelSerializer):

    cost_estimate_currency = CurrencyIdNameSerializer()

    class Meta:
        model = WorkOrder
        fields = WO_FIELDS + ('scid',)
