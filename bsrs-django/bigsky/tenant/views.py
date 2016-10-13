from rest_framework import permissions, viewsets

from tenant.models import Tenant
from tenant.permissions import TenantPermissions
from tenant import serializers as ts


class TenantViewSet(viewsets.ModelViewSet):

    queryset = Tenant.objects.all()
    permission_classes = (permissions.IsAuthenticated, TenantPermissions)

    def get_serializer_class(self):
        if self.action == 'list':
            return ts.TenantListSerializer
        elif self.action == 'retrieve':
            return ts.TenantDetailSerializer
        elif self.action == 'create':
            return ts.TenantCreateSerializer
        else:
            return ts.TenantUpdateSerializer
