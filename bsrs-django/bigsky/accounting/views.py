from django.core.exceptions import ValidationError

from rest_framework import viewsets, permissions

from accounting.models import Currency
from accounting.serializers import CurrencySerializer
from util.views import BaseModelViewSet


class CurrencyViewSet(BaseModelViewSet):

    queryset = Currency.objects.all()
    serializer_class = CurrencySerializer
    permission_classes = (permissions.IsAuthenticated,)

    # def create(self, request, *args, **kwargs):
    #     serializer = self.get_serializer(data=request.data)
        
    #     print 'Pre validators','\n'
    #     try:
    #         serializer.is_valid(raise_exception=True)
    #     except ValidationError:
    #         print 'DjangoValidationError RAISED'
    #         raise
    #     print 'Post validators','\n'
    #     print serializer,'\n'

    #     self.perform_create(serializer)
    #     headers = self.get_success_headers(serializer.data)
    #     return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)