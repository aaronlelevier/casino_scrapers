import copy

from rest_framework import viewsets, status
from rest_framework.decorators import list_route
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from translation.models import Locale, Translation
from translation.serializers import (LocaleSerializer, TranslationBootstrapSerializer,
    TranslationSerializer, TranslationListSerializer)
from utils.mixins import DestroyModelMixin
from utils.views import BaseModelViewSet

### LOCALE

class LocaleViewSet(BaseModelViewSet):

    model = Locale
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
    model = Translation
    permission_classes = (IsAuthenticated,)
    serializer_class = TranslationBootstrapSerializer
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
        queryset = Translation.objects.all().select_related('locale')

        locale = self.request.query_params.get('locale', None)
        if locale is not None:
            queryset = queryset.filter(
                locale__locale__istartswith=locale[:2]
                ).extra(
                where=["CHAR_LENGTH(locale) <= {}".format(len(locale))]
                )

        tzname = self.request.query_params.get('timezone', None)
        if tzname:
            self.request.session['timezone'] = tzname

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
    model = Translation
    permission_classes = (IsAuthenticated,)
    serializer_class = TranslationSerializer
    queryset = Translation.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return TranslationListSerializer
        else:
            return TranslationSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        # custom: start
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.search_multi(keyword=search)
        else:
            queryset = queryset.all_distinct_keys()
        # custom: end
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @list_route(methods=['GET', 'POST'], url_path=r"(?P<key>[\w\.]+)")
    def get_translations_by_key(self, request, key=None):
        if request.method == 'GET':
            response = {
                'id': key,
                'key': key,
                'locales': []
            }
            for t in Translation.objects.all().select_related('locale'):
                response['locales'].append({
                        'locale': str(t.locale.id),
                        'translation': t.values.get(key, "")
                    })
            return Response(response)

        elif request.method == 'POST':
            self.errors = []

            data = copy.copy(request.data)
            self._run_update_trans(data, key)
            if self.errors:
                raise ValidationError(*self.errors)

            return Response(data, status=status.HTTP_200_OK)

    def _run_update_trans(self, data, key):
        for locale_data in data['locales']:
            try:
                locale = self._validate_locale(locale_data)
                self._update_trans(
                    trans=locale.translation,
                    key=key,
                    value=locale_data['translation']
                )
            except (KeyError, Locale.DoesNotExist) as e:
                self.errors.append(str(e))

    def _update_trans(self, trans, key, value):
        if not value:
            trans.values.pop(key, None)
        else:
            trans.values.update({key: value})

        trans.save()

    def _validate_locale(self, locale_data):
        try:
            return Locale.objects.get(id=locale_data['locale'])
        except Locale.DoesNotExist:
            raise
