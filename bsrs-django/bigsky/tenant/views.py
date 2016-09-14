from rest_framework import exceptions, permissions, viewsets

from tenant.models import Tenant
from tenant.permissions import TenantPermissions
from tenant import serializers as ts


class TenantViewSet(viewsets.ModelViewSet):
    """
    Only `GET` and `PUT` supported.
    """
    queryset = Tenant.objects.all()
    permission_classes = (permissions.IsAuthenticated, TenantPermissions)

    def get_serializer_class(self):
        if self.action == 'list':
            return ts.TenantListSerializer
        elif self.action == 'create':
            return ts.TenantCreateSerializer
        else:
            return ts.TenantDetailSerializer
