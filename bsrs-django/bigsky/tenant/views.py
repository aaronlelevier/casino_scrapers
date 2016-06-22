from rest_framework import exceptions, permissions, viewsets
from rest_framework.decorators import list_route
from rest_framework.response import Response

from tenant.models import Tenant
from tenant.serializers import TenantSerializer


class TenantViewSet(viewsets.ModelViewSet):
    """
    **API Endpoint:**

      - Get Tenant: `/api/admin/tenant/get/`

      - Update Tenant: `/api/admin/tenant/put/`
    """
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer
    permission_classes = (permissions.IsAuthenticated,)

    # all main methods on the normal tenant api url are not allowed
    # (must use the specific list routes)

    def get_serializer_class(self):
        raise exceptions.MethodNotAllowed(method=self.action)

    def destroy(self, request, *args, **kwargs):
        raise exceptions.MethodNotAllowed(method="delete")

    @list_route(methods=['GET'], url_path=r"get")
    def tenant_get(self, request):
        """
        Returns a Detail record the the logged in User's Tenant.

        A ``list`` endpoint is used here b/c there is not 'pk' kwarg in the URL,
        since the Tenant Detail record is determined by the logged in User.
        """
        instance = request.user.role.tenant
        serializer = TenantSerializer(instance)
        return Response(serializer.data)

    @list_route(methods=['PUT'], url_path=r"put")
    def tenant_put(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = request.user.role.tenant
        serializer = TenantSerializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
