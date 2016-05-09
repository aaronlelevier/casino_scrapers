import copy
import itertools
import logging
logger = logging.getLogger(__name__)

from django.conf import settings

from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from category.models import Category
from ticket.mixins import CreateTicketModelMixin, UpdateTicketModelMixin
from ticket.models import Ticket, TicketActivity
from ticket.serializers import (TicketSerializer, TicketCreateSerializer,
    TicketListSerializer, TicketActivitySerializer)
from utils.mixins import EagerLoadQuerySetMixin, SearchMultiMixin
from utils.views import BaseModelViewSet


class TicketQuerySetFilters(object):

    def get_queryset(self):
        queryset = super(TicketQuerySetFilters, self).get_queryset()

        if settings.TICKET_FILTERING_ON:
            queryset = queryset.filter_on_categories_and_location(self.request.user)
            logging.info(queryset.query)
        return queryset


class TicketViewSet(EagerLoadQuerySetMixin, TicketQuerySetFilters, CreateTicketModelMixin,
    UpdateTicketModelMixin, SearchMultiMixin, BaseModelViewSet):

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

    def create(self, request, *args, **kwargs):
        """
        Add the User making the POST request as the 'creator' of this Ticket.
        """
        request.data['creator'] = request.user.id
        return super(TicketViewSet, self).create(request, *args, **kwargs)


class TicketDjaViewSet(TicketViewSet):
    """
    Sideloading of Categories spike.
    """

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)

            data = copy.copy(serializer.data)
            return_data = {
                'data': data,
                'included': self.get_included(data)
            }
            return self.get_paginated_response(return_data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def get_included(self, data):
        """Return distinct category objects."""
        categories = []

        ids = set(itertools.chain(*[d['category_ids'] for d in data]))
        collected_ids = set()

        for ticket in data:
            for category in ticket['categories']:
                if category['id'] not in collected_ids:
                    collected_ids.update([category['id']])
                    category['type'] = Category._meta.verbose_name_plural.lower()
                    categories.append(category)

        return categories


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
