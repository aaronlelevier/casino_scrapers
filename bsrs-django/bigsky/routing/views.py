import copy

from rest_framework import permissions, viewsets
from rest_framework.exceptions import MethodNotAllowed

from location.models import LocationLevel
from routing.models import Assignment, AvailableFilter, AUTO_ASSIGN
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
            return rs.AvailableFilterSerializer
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
        assignment_with_auto_assign = Assignment.objects.auto_assign_filter_in_use(request.user.role.tenant)
        response.data = self._combine_dynamic_data(data, assignment_with_auto_assign)
        return response

    def _combine_dynamic_data(self, data, assignment_with_auto_assign):
        """
        Looks for dynamic AvailableFilters. If it finds one, remove that filter
        placeholder, and replace it with dynamic versions of itself.
        Adds data to auto assign filter for use in power select only if another assignment
        has auto_assign (which is likely the case for all customers after they are setup)
        """
        data_copy = copy.copy(data)
        location_filter = None
        auto_assign_filter = None
        for i, d in enumerate(data_copy['results']):
            if d['lookups'] == {'filters': 'location_level'}:
                location_filter = data['results'].pop(i)

            if d['field'] == AUTO_ASSIGN and assignment_with_auto_assign:
                data['results'][i]['existingAssignment'] = assignment_with_auto_assign.description
                data['results'][i]['disabled'] = True

        if location_filter:
            filters = []
            for x in LocationLevel.objects.all():
                filters.append(x.available_filter_data(location_filter['id']))
            data['results'] += filters

        data['count'] = len(data['results'])
        return data
