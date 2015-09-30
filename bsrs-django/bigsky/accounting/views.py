from rest_framework import permissions

from accounting.models import Currency
from accounting.serializers import CurrencySerializer
from util.views import BaseModelViewSet


class CurrencyViewSet(BaseModelViewSet):

    queryset = Currency.objects.all()
    serializer_class = CurrencySerializer
    permission_classes = (permissions.IsAuthenticated,)