from rest_framework import exceptions, permissions, viewsets

from tenant.models import Tenant
from tenant.permissions import TenantPermissions
from tenant.serializers import TenantDetailSerializer, TenantSerializer


class TenantViewSet(viewsets.ModelViewSet):
    """
    Only `GET` and `PUT` supported.
    """
    queryset = Tenant.objects.all()
    permission_classes = (permissions.IsAuthenticated, TenantPermissions)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TenantDetailSerializer
        else:
            return TenantSerializer

    def destroy(self, request, *args, **kwargs):
        raise exceptions.MethodNotAllowed(method="delete")
