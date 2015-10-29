import copy

from rest_framework import viewsets, status
from rest_framework.decorators import list_route
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from translation.models import Locale, Translation
from translation.serializers import LocaleSerializer, TranslationSerializer
from utils.mixins import DestroyModelMixin
from utils.views import BaseModelViewSet

### LOCALE

class LocaleViewSet(BaseModelViewSet):

    permission_classes = (IsAuthenticated,)
    serializer_class = LocaleSerializer
    queryset = Locale.objects.all()


### TRANSLATION

class TranslationBootstrapViewSet(viewsets.ModelViewSet):
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
            return Response({next(iter(d)):d[next(iter(d))] for d in data})
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


class TranslationViewSet(DestroyModelMixin, viewsets.ModelViewSet):
    '''
    The `list` endpoint, which displays all available Translation keys,
    uses the `en` locale for all available Keys. *(Main English Language
    Locale)*.  This is for efficiency, because otherwise we would need
    to compare all available Translations for all Keys each time.

    ## Filters

       **1. List all Translation Keys for the default Locale site setting:**

       URL: `/api/admin/translations/`

       **2. All Translations for a single Translation Key:**

       URL: `/api/admin/translations/{translation-key}/`
    '''
    permission_classes = (IsAuthenticated,)
    serializer_class = TranslationSerializer
    queryset = Translation.objects.all()

    def get_paginated_response(self, data):
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

    @list_route(methods=['GET', 'POST'], url_path=r"(?P<key>[\w\.]+)")
    def get_translations_by_key(self, request, key=None):
        if request.method == 'GET':
            translations = Translation.objects.filter(values__has_key=key)
            return Response([{
                'id': str(t.id),
                'translations': {
                    'locale': str(t.locale.id),
                    'text': t.values.get(key, ""),
                    'helper': t.context.get(key, "") if t.context else ""
                }
            } for t in translations])

        elif request.method == 'POST':
            self.final_data = []
            self.errors = []

            for data in request.data:
                data = copy.copy(data)

                try:
                    self.locale = self.validate_locale(data)
                    trans, created = Translation.objects.get_or_create(id=data['id'])
                    self.update_trans(trans, key, data)
                    self.final_data.append(data)
                except (KeyError, Locale.DoesNotExist) as e:
                    self.errors.append(str(e))

            if self.errors:
                raise ValidationError(*self.errors)

            # Will only be the Response Code of the last Object
            response_status = self.get_created_status(created)

            return Response(self.final_data, status=response_status)

    def validate_locale(self, data):
        try:
            return Locale.objects.get(id=data['translations']['locale'])
        except Locale.DoesNotExist:
            raise

    def update_trans(self, trans, key, data):
        trans.locale = self.locale

        if not data['translations']['text']:
            trans.values.pop(key)
        else:
            trans.values.update({key: data['translations']['text']})

        trans.context.update({key: data['translations'].get('helper', '')})

        if not data['translations'].get('helper', ''):
            trans.context.pop(key)
        else:
            trans.context.update({key: data['translations']['helper']})

        trans.save()

    def get_created_status(self, created):
        if created:
            return status.HTTP_201_CREATED
        else:
            return status.HTTP_200_OK
