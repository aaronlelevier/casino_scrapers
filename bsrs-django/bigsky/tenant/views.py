from rest_framework import exceptions, permissions, viewsets

from tenant.models import Tenant
from tenant.permissions import TenantPermissions
from tenant.serializers import TenantDetailSerializer, TenantUpdateSerializer


class TenantViewSet(viewsets.ModelViewSet):
    """
    Only `GET` and `PUT` supported.
    """
    queryset = Tenant.objects.all()
    permission_classes = (permissions.IsAuthenticated, TenantPermissions)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TenantDetailSerializer
        elif self.action == 'update':
            return TenantUpdateSerializer
        raise exceptions.MethodNotAllowed(method=self.action)

    def destroy(self, request, *args, **kwargs):
        raise exceptions.MethodNotAllowed(method="delete")
