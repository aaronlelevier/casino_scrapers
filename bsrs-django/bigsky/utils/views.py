from rest_framework import viewsets

from utils.mixins import (CheckIdCreateMixin, DestroyModelMixin, OrderingQuerySetMixin,
    FilterRelatedMixin, RelatedOrderingQuerySetMixin)


class BaseModelViewSet(CheckIdCreateMixin, DestroyModelMixin, FilterRelatedMixin,
    OrderingQuerySetMixin, RelatedOrderingQuerySetMixin, viewsets.ModelViewSet):
    pass
