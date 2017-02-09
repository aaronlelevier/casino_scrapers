from rest_framework import permissions
from rest_framework.exceptions import MethodNotAllowed

from utils.permissions import CrudPermissions
from utils.views import BaseModelViewSet
from work_order import serializers as ws
from work_order.models import WorkOrder


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
        """
        Add the User making the POST request as the 'requester'
        """
        request.data['approver'] = request.user.id
        return super(WorkOrderViewSet, self).create(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        WorkOrder is a contract, delete action is not allowed
        """
        raise MethodNotAllowed(method='destroy')
