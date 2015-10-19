from rest_framework import viewsets
from rest_framework.decorators import list_route
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
    The `list` endpoint, which displays all available Translation keys, 
    uses the `en` locale for all available Keys. *(Main English Language 
    Locale)*.  This is for efficiency, because otherwise we would need 
    to compare all available Translations for all Keys each time.

    ## Filters

       **1. Filter by Locale.name:**

       URL: `/api/translations/bootstrap/{locale}/`

       **2. All Translations for a single Translation Key:**

       URL: `/api/translations/{translation-key}/`
    '''
    permission_classes = (IsAuthenticated,)
    serializer_class = TranslationSerializer
    queryset = Translation.objects.all()

    def get_paginated_response(self, data):
        """
        The response should always be an object.  The key each item in the 
        object is the Locale, and the value is the Translation ``key:value`` 
        object for that Translation.
        """
        if data:
            return Response({next(iter(d)):d[next(iter(d))] for d in data})
        else:
            raise NotFound

    def list(self, request):
        try:
            translation = Translation.objects.get(locale__locale='en')
        except Translation.DoesNotExist:
            return Response([])
        return Response(sorted(translation.values.keys()))

    @list_route(methods=['GET'], url_path=r"bootstrap/(?P<locale>[\w\-\_]+)")
    def bootstrap(self, request, locale=None):
        queryset = Translation.objects.all()
        if locale is not None:
            queryset = queryset.filter(
                locale__locale__istartswith=locale[:2]
                ).extra(
                where=["CHAR_LENGTH(locale) <= {}".format(len(locale))]
                )
        serializer = TranslationSerializer(queryset, many=True)
        return Response(serializer.data)

    @list_route(methods=['GET'], url_path=r"(?P<key>[\w\.]+)")
    def translation_key(self, request, key=None):
        translations = Translation.objects.filter(values__has_key=key)
        return Response([{
            'id': str(t.id),
            'translations': {
                'locale': str(t.locale.id),
                'text': t.values.get(key, ""),
                'helper': t.context.get(key, "") if t.context else ""
            }
        } for t in translations])


