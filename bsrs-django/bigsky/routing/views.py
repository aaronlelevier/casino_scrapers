import copy
import uuid

from django.conf import settings

from rest_framework import permissions, viewsets
from rest_framework.exceptions import MethodNotAllowed

from location.models import LocationLevel
from routing.models import Assignment, AvailableFilter
from routing import serializers as rs
from utils.mixins import EagerLoadQuerySetMixin, SearchMultiMixin
from utils.views import BaseModelViewSet


class AssignmentViewSet(EagerLoadQuerySetMixin, SearchMultiMixin, BaseModelViewSet):

    model = Assignment
    queryset = Assignment.objects.all()
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return rs.AssignmentDetailSerializer
        if self.action == 'list':
            return rs.AssignmentListSerializer
        else:
            return rs.AssignmentCreateUpdateSerializer

    def create(self, request, *args, **kwargs):
        """
        Attach tenant based upon User for validating uniqueness of
        description and order by Tenant.
        """
        request.data['tenant'] = request.user.role.tenant.id
        return super(AssignmentViewSet, self).create(request, *args, **kwargs)


class AvailableFilterViewSet(viewsets.ModelViewSet):

    model = AvailableFilter
    queryset = AvailableFilter.objects.all()
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_class(self):
        if self.action == 'list':
            return rs.AvailableFilterListSerializer
        else:
            raise MethodNotAllowed(method=self.action)

    def perform_destroy(self, instance):
            raise MethodNotAllowed(method=self.action)

    def list(self, request, *args, **kwargs):
        response = super(AvailableFilterViewSet, self).list(request, *args, **kwargs)

        data = copy.copy(response.data)
        response.data = self._combine_dynamic_data(data)
        return response

    def _combine_dynamic_data(self, data):
        for i, d in enumerate(data['results']):
            if d['lookups'] == {'filters': 'location_level'}:
                location_level_filter = data['results'].pop(i)

        if location_level_filter:
            filters = []
            for x in LocationLevel.objects.all():
                filters.append({
                    'id': str(uuid.uuid4()),
                    'key': x.name,
                    'key_is_i18n': False,
                    'context': settings.DEFAULT_PROFILE_FILTER_CONTEXT,
                    'field': 'location',
                    'lookups': {
                        'location_level': str(x.id)
                    }
                })
        data['results'] += filters
        data['count'] = len(data['results'])
        return data
