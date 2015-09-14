from rest_framework import viewsets
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

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

    def get_paginated_response(self, data):
        """
        The response should alwasy be an object.  The key each item in the 
        object is the Locale, and the value is the Translation ``key:value`` 
        object for that Translation.
        """
        if data:
            return Response({d.iterkeys().next(): d.itervalues().next() for d in data})
        else:
            raise NotFound

    def get_queryset(self):
        queryset = Translation.objects.all()
        locale = self.request.query_params.get('locale', None)
        if locale is not None:
            queryset = queryset.filter(
                locale__locale__istartswith=locale[:2]
                ).extra(
                where=["CHAR_LENGTH(locale) <= {}".format(len(locale))]
                )
        return queryset