from rest_framework import permissions

from utils.permissions import CrudPermissions
from utils.views import BaseModelViewSet
from work_order.models import WorkOrder
from work_order import serializers as ws


class WorkOrderViewSet(BaseModelViewSet):

    model = WorkOrder
    permission_classes = (permissions.IsAuthenticated, CrudPermissions)
    queryset = WorkOrder.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return ws.WorkOrderListSerializer
        elif self.action == 'create':
            return ws.WorkOrderCreateSerializer
        elif self.action in ('update', 'partial_update'):
            return ws.WorkOrderUpdateSerializer
        else:
            return ws.WorkOrderSerializer

    def create(self, request, *args, **kwargs):
        request.data['requester'] = request.user.id
        return super(WorkOrderViewSet, self).create(request, *args, **kwargs)
