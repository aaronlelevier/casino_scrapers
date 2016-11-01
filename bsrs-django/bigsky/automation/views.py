import copy

from rest_framework import permissions, viewsets, mixins
from rest_framework.exceptions import MethodNotAllowed

from location.models import LocationLevel
from automation.models import (AutomationEvent, Automation, AutomationFilterType,
    AutomationActionType)
from automation import serializers as rs
from utils.mixins import EagerLoadQuerySetMixin, SearchMultiMixin
from utils.views import BaseModelViewSet


class AutomationEventViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):

    queryset = AutomationEvent.objects.all()
    serializer_class = rs.AutomationEventSerializer
    permission_classes = (permissions.IsAuthenticated,)


class AutomationActionTypeViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):

    queryset = AutomationActionType.objects.all()
    serializer_class = rs.AutomationActionTypeSerializer
    permission_classes = (permissions.IsAuthenticated,)


class AutomationViewSet(EagerLoadQuerySetMixin, SearchMultiMixin, BaseModelViewSet):

    model = Automation
    queryset = Automation.objects.all()
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return rs.AutomationDetailSerializer
        if self.action == 'list':
            return rs.AutomationListSerializer
        else:
            return rs.AutomationCreateUpdateSerializer

    def create(self, request, *args, **kwargs):
        """
        Attach tenant based upon User for validating uniqueness of
        description and order by Tenant.
        """
        request.data['tenant'] = request.user.role.tenant.id
        return super(AutomationViewSet, self).create(request, *args, **kwargs)


class AutomationFilterTypeViewSet(viewsets.ModelViewSet):

    model = AutomationFilterType
    queryset = AutomationFilterType.objects.all()
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_class(self):
        if self.action == 'list':
            return rs.AutomationFilterTypeSerializer
        else:
            raise MethodNotAllowed(method=self.action)

    def perform_destroy(self, instance):
            raise MethodNotAllowed(method=self.action)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
        else:
            serializer = self.get_serializer(queryset, many=True)
            response = Response(serializer.data)

        data = copy.copy(response.data)
        response.data = self._combine_dynamic_data(data, request)
        return response

    def _combine_dynamic_data(self, data, request):
        """
        Looks for dynamic AutomationFilterTypes. If it finds one, remove that filter
        placeholder, and replace it with dynamic versions of itself.
        """
        data_copy = copy.copy(data)
        location_filter = None

        for i, d in enumerate(data_copy['results']):
            if d['lookups'] == {'filters': 'location_level'}:
                location_filter = data['results'].pop(i)

        if location_filter:
            filters = []
            for x in LocationLevel.objects.all():
                filters.append(x.automation_filter_type_data(location_filter['id']))
            data['results'] += filters

        data['results'] = sorted(data['results'], key=lambda x: x['key'])
        data['count'] = len(data['results'])
        return data
