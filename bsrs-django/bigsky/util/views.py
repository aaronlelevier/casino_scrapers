from rest_framework import viewsets

from util.mixins import DestroyModelMixin


class BaseModelViewSet(DestroyModelMixin, viewsets.ModelViewSet):
	pass
