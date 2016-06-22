from tenant.models import Tenant
from tenant.serializers import TenantSerializer


class TenantView(generics.RetrieveUpdateAPIView):

    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    # def put(self, request, *args, **kwargs):
    #     return self.update(request, *args, **kwargs)from django.shortcuts import render
