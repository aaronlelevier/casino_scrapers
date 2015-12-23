from utils.views import BaseModelViewSet
from work_order.models import WorkOrder
from work_order.serializers import (WorkOrderCreateSerializer, WorkOrderSerializer, WorkOrderListSerializer,)


class WorkOrderViewSet(BaseModelViewSet):

    model = WorkOrder
    queryset = WorkOrder.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return WorkOrderListSerializer 
        elif self.action in ('create', 'update', 'partial_update'):
            return WorkOrderCreateSerializer
        else:
            return WorkOrderSerializer
