from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from translation.models import Locale, Translation
from translation.serializers import LocaleSerializer, TranslationSerializer


class LocaleViewSet(viewsets.ModelViewSet):

    permission_classes = (IsAuthenticated,)
    serializer_class = LocaleSerializer
    queryset = Locale.objects.all()


class TranslationViewSet(viewsets.ModelViewSet):

    permission_classes = (IsAuthenticated,)
    serializer_class = TranslationSerializer
    queryset = Translation.objects.all()