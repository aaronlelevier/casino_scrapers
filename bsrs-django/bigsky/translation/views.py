from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from translation.models import Locale, Definition
from translation.serializers import LocaleSerializer, DefinitionSerializer


class LocaleViewSet(viewsets.ModelViewSet):

    permission_classes = (IsAuthenticated,)
    serializer_class = LocaleSerializer
    queryset = Locale.objects.all()


class DefinitionViewSet(viewsets.ModelViewSet):

    permission_classes = (IsAuthenticated,)
    serializer_class = DefinitionSerializer
    queryset = Definition.objects.all()