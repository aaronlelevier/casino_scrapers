from rest_framework import viewsets

from utils.mixins import (CheckIdCreateMixin, DestroyModelMixin, OrderingQuerySetMixin,
    FilterRelatedMixin)


class BaseModelViewSet(CheckIdCreateMixin, DestroyModelMixin, FilterRelatedMixin,
    OrderingQuerySetMixin, viewsets.ModelViewSet):
    pass
