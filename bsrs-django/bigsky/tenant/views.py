from rest_framework import exceptions, permissions, viewsets
from rest_framework.decorators import list_route
from rest_framework.response import Response

from tenant.models import Tenant
from tenant.permissions import TenantPermissions
from tenant.serializers import TenantSerializer


class TenantViewSet(viewsets.ModelViewSet):
    """
    Only `GET` and `PUT` supported.
    """

    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer
    permission_classes = (permissions.IsAuthenticated, TenantPermissions)

    def get_serializer_class(self):
        if self.action in ('retrieve', 'update'):
            return TenantSerializer
        raise exceptions.MethodNotAllowed(method=self.action)

    def destroy(self, request, *args, **kwargs):
        raise exceptions.MethodNotAllowed(method="delete")
