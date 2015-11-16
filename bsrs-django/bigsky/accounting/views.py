from rest_framework import permissions

from accounting.models import Currency
from accounting.serializers import CurrencySerializer
from utils.views import BaseModelViewSet


class CurrencyViewSet(BaseModelViewSet):

    model = Currency
    queryset = Currency.objects.all()
    serializer_class = CurrencySerializer
    permission_classes = (permissions.IsAuthenticated,)
