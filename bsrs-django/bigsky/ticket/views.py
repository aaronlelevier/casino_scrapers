from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ticket.mixins import CreateTicketModelMixin, UpdateTicketModelMixin
from ticket.models import Ticket, TicketActivity
from ticket.serializers import (TicketSerializer, TicketCreateSerializer,
    TicketListSerializer, TicketActivitySerializer)
from utils.mixins import EagerLoadQuerySetMixin
from utils.views import BaseModelViewSet


# COMMENT OUT: Add this back after ``ticket.tests.test_views`` are refactored to work w/ these restrictions
# class TicketQuerySetFilters(object):

#     def get_queryset(self):
#         queryset = super(TicketQuerySetFilters, self).get_queryset()

#         queryset = self._filter_by_person_attrs(queryset)

#         return queryset

#     def _filter_by_person_attrs(self, queryset):
#         kwargs = {}
#         kwargs.update({
#             'categories__id__in': self.request.user.role.categories.values_list('id', flat=True),
#             'location__id__in': self.request.user.locations.values_list('id', flat=True)
#         })
#         return queryset.filter(**kwargs)


class TicketViewSet(EagerLoadQuerySetMixin, CreateTicketModelMixin,
    UpdateTicketModelMixin, BaseModelViewSet):

    model = Ticket
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = (IsAuthenticated,)
    filter_fields = [f.name for f in model._meta.get_fields()]

    def get_serializer_class(self):
        """
        set the serializer based on the method
        """
        if self.action == 'list':
            return TicketListSerializer
        elif self.action in ('create', 'update', 'partial_update'):
            return TicketCreateSerializer
        else:
            return TicketSerializer

    def get_queryset(self):
        """
        :search: will use the ``Q`` lookup class:

        https://docs.djangoproject.com/en/1.8/topics/db/queries/#complex-lookups-with-q-objects
        """
        queryset = super(TicketViewSet, self).get_queryset()

        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.search_multi(keyword=search)

        return queryset

class TicketActivityViewSet(BaseModelViewSet):

    model = TicketActivity
    queryset = TicketActivity.objects.all()
    serializer_class = TicketActivitySerializer
    permission_classes = (IsAuthenticated,)
    filter_fields = [f.name for f in model._meta.get_fields()]

    def get_serializer_class(self):
        if self.action == 'list':
            return TicketActivitySerializer
        else:
            raise MethodNotAllowed(method=self.action)

    def list(self, request, *args, **kwargs):
        """
        This List Endpoint should always be filtered for TicketActivities for
        a single Ticket.
        """
        queryset = self.filter_queryset(self.get_queryset())
        # custom: start
        pk = kwargs.get('pk', None)
        if pk:
            queryset = queryset.filter(ticket=pk)
        # custom: end
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

