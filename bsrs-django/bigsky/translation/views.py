from rest_framework import viewsets
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import rest_framework_filters as filters

from translation.models import Locale, Translation
from translation.serializers import LocaleSerializer, TranslationSerializer


### LOCALE

class LocaleViewSet(viewsets.ModelViewSet):

    permission_classes = (IsAuthenticated,)
    serializer_class = LocaleSerializer
    queryset = Locale.objects.all()


### TRANSLATION

class TranslationViewSet(viewsets.ModelViewSet):
    '''
    ## Filters

       **1. Filter by Locale.name:**

       URL: `/api/translations/?locale=en`
    '''
    permission_classes = (IsAuthenticated,)
    serializer_class = TranslationSerializer
    queryset = Translation.objects.all()
    # filter_class = TranslationFilterSet

    def get_paginated_response(self, data):
        if len(data) > 1:
            return Response(data)
        elif len(data) == 1:
            return Response(data[0])
        else:
            raise NotFound

    def get_queryset(self):
        queryset = Translation.objects.all()
        locale = self.request.query_params.get('locale', None)
        if locale is not None:
            try:
                queryset = queryset.filter(locale__locale=locale)
            except Translation.DoesNotExist:
                raise NotFound
        return queryset