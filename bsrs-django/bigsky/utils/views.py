from django.core.exceptions import ObjectDoesNotExist

from rest_framework import viewsets, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from utils.mixins import (CheckIdCreateMixin, DestroyModelMixin, OrderingQuerySetMixin,
    FilterRelatedMixin)


class BaseModelViewSet(CheckIdCreateMixin, DestroyModelMixin, FilterRelatedMixin,
    OrderingQuerySetMixin, viewsets.ModelViewSet):
    pass
