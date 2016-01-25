from django.shortcuts import get_object_or_404

from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import detail_route, list_route
from rest_framework.exceptions import MethodNotAllowed

from location.models import Location, LocationLevel, LocationStatus, LocationType
from location import serializers as ls
from utils.views import BaseModelViewSet


class SelfReferencingRouteMixin(object):

    @detail_route(methods=['GET'], url_path=r'get-all-children')
    def get_all_children(self, request, pk=None):
        instance = get_object_or_404(self.model, pk=pk)
        related_instances = self.queryset.get_all_children(instance)
        serializer = self._all_related_serializer(related_instances, many=True)
        return Response(serializer.data)

    @detail_route(methods=['GET'], url_path=r'get-all-parents')
    def get_all_parents(self, request, pk=None):
        instance = get_object_or_404(self.model, pk=pk)
        related_instances = self.queryset.get_all_parents(instance)
        serializer = self._all_related_serializer(related_instances, many=True)
        return Response(serializer.data)


### LOCATION LEVEL

class LocationLevelViewSet(SelfReferencingRouteMixin, BaseModelViewSet):
    '''
    ## Detail Routes

    **1. get_all_children:**

       Will return all *Child LocationsLevels*
       
       URL: `/api/admin/location-levels/{pk}/get-all-children/`

       LocationLevel ID: `{pk}`

    **2. get_all_parents:**

       Will return all *Parent LocationsLevels*
       
       URL: `/api/admin/location-levels/{pk}/get-all-parents/`

       LocationLevel ID: `{pk}`
    '''
    model = LocationLevel
    permission_classes = (IsAuthenticated,)
    queryset = LocationLevel.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return ls.LocationLevelSerializer
        elif self.action == 'retrieve':
            return ls.LocationLevelDetailSerializer
        elif self.action in ('create', 'update', 'partial_update'):
            return ls.LocationLevelCreateSerializer
        else:
            raise MethodNotAllowed(method=self.action)

    @property
    def _all_related_serializer(self):
        return ls.LocationLevelDetailSerializer
    

class LocationStatusViewSet(BaseModelViewSet):

    model = LocationStatus
    permission_classes = (IsAuthenticated,)
    serializer_class = ls.LocationStatusSerializer
    queryset = LocationStatus.objects.all()


class LocationTypeViewSet(BaseModelViewSet):

    model = LocationType
    permission_classes = (IsAuthenticated,)
    serializer_class = ls.LocationTypeSerializer
    queryset = LocationType.objects.all()


class LocationViewSet(SelfReferencingRouteMixin, BaseModelViewSet):
    '''
    ## Detail Routes

    **1. get_all_children:**

       Will return all *Child Locations*
       
       URL: `/api/admin/locations/{pk}/get-all-children/`

       Location ID: `{pk}`

    **2. get_all_parents:**

       Will return all *Parent Locations*
       
       URL: `/api/admin/locations/{pk}/get-all-parents/`

       Location ID: `{pk}`

    **3. get_level_children:**

       Will return all *Child Locations* for a given *LocationLevel*
       
       URL: `/api/admin/locations/get-level-children/{pk}/?name__icontains={x}`

       Location ID: `{pk}`


    **4. get_level_parents:**

       Will return all *Parent Locations* `{pk}` for a given *LocationLevel* `{level_id}`
       
       URL: `/api/admin/locations/get-level-parents/{pk}/{level_id}}`

       Location ID: `{pk}`


    **5. Filter for location_level:**

       Filter for available Locations based on the Role's LocationLevel

       URL: `/api/admin/locations/?location_level={level_id}`

       URL2: `/api/admin/locations/?location_level={level_id}&name__icontains={x}`

       LocationLevel ID where: `person.role.location_level == location.location_level`
    
    '''
    model = Location
    permission_classes = (IsAuthenticated,)
    queryset = Location.objects.all()
    filter_fields = [f.name for f in model._meta.get_fields()]

    def get_serializer_class(self):
        if self.action == 'list':
            return ls.LocationListSerializer
        elif self.action == 'retrieve':
            return ls.LocationDetailSerializer
        elif self.action in ('create', 'update', 'partial_update'):
            return ls.LocationUpdateSerializer
        else:
            raise MethodNotAllowed(method=self.action)

    @property
    def _all_related_serializer(self):
        return ls.LocationListSerializer

    def get_queryset(self):
        queryset = super(LocationViewSet, self).get_queryset()

        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.search_multi(keyword=search)

        return queryset

    @list_route(methods=['GET'], url_path=r'get-level-children/(?P<pk>[\w\-]+)/(?P<llevel_id>[\w\-]+)')
    def get_level_children(self, request, pk=None, llevel_id=None):
        instance = get_object_or_404(self.model, pk=pk)
        queryset = Location.objects.get_level_children(instance, llevel_id)
        queryset = self.filter_by_query_params(queryset)
        page = self.paginate_queryset(queryset)
        serializer = self._all_related_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @list_route(methods=['GET'], url_path=r'get-level-parents/(?P<pk>[\w\-]+)/(?P<llevel_id>[\w\-]+)')
    def get_level_parents(self, request, pk=None, llevel_id=None):
        instance = get_object_or_404(self.model, pk=pk)
        queryset = Location.objects.get_level_parents(instance, llevel_id)
        queryset = self.filter_by_query_params(queryset)
        page = self.paginate_queryset(queryset)
        serializer = self._all_related_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)
