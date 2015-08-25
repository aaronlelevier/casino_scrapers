from django.shortcuts import get_object_or_404

from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import detail_route
from rest_framework.exceptions import MethodNotAllowed
import rest_framework_filters as filters

from contact.views import AddressFilterSet
from location.models import Location, LocationLevel, LocationStatus, LocationType
from location import serializers as ls
from util.views import BaseModelViewSet


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
       
       URL: `/api/admin/location_levels/{pk}/get-all-children/`

       LocationLevel ID: `{pk}`

    **2. get_all_parents:**

       Will return all *Parent LocationsLevels*
       
       URL: `/api/admin/location_levels/{pk}/get-all-parents/`

       LocationLevel ID: `{pk}`
    '''
    permission_classes = (IsAuthenticated,)
    queryset = LocationLevel.objects.all()
    model = LocationLevel

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

    permission_classes = (IsAuthenticated,)
    serializer_class = ls.LocationStatusSerializer
    queryset = LocationStatus.objects.all()


class LocationTypeViewSet(BaseModelViewSet):

    permission_classes = (IsAuthenticated,)
    serializer_class = ls.LocationTypeSerializer
    queryset = LocationType.objects.all()


### LOCATION

class LocationFilterSet(filters.FilterSet):

    location_level = filters.AllLookupsFilter(name='location_level')
    
    class Meta:
        model= Location
        fields = ['location_level']


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
       
       URL: `/api/admin/locations/{pk}/get-level-children/{level_id}/`

       Location ID: `{pk}`

       LocationLevel ID of the given *LocationLevel* to filter: `{level_id}`

    **4. get_level_parents:**

       Will return all *Parent Locations* `{pk}` for a given *LocationLevel* `{level_id}`
       
       URL: `/api/admin/locations/{pk}/get-level-parents/{level_id}/`

       Location ID: `{pk}`

       LocationLevel ID of the given *LocationLevel* to filter: `{level_id}`

    **5. Filter for location_level:**

       Filter for available Locations based on the Role's LocationLevel

       URL: `/api/admin/locations/?location_level={level_id}`

       LocationLevel ID where: `person.role.location_level == location.location_level`
    
    '''
    permission_classes = (IsAuthenticated,)
    queryset = Location.objects.all()
    model = Location
    filter_class = LocationFilterSet

    def get_serializer_class(self):
        if self.action == 'list':
            return ls.LocationListSerializer
        elif self.action == 'retrieve':
            return ls.LocationDetailSerializer
        elif self.action == 'create': 
            return ls.LocationCreateSerializer
        elif self.action in ('update', 'partial_update'):
            return ls.LocationUpdateSerializer
        else:
            raise MethodNotAllowed(method=self.action)

    @property
    def _all_related_serializer(self):
        return ls.LocationDetailSerializer

    @detail_route(methods=['GET'], url_path=r'get-level-children/(?P<level_id>[\w\-]+)')
    def get_level_children(self, request, pk=None, level_id=None):
        instance = get_object_or_404(self.model, pk=pk)
        related_instances = Location.objects.get_level_children(instance, level_id)
        serializer = self._all_related_serializer(related_instances, many=True)
        return Response(serializer.data)

    @detail_route(methods=['GET'], url_path=r'get-level-parents/(?P<level_id>[\w\-]+)')
    def get_level_parents(self, request, pk=None, level_id=None):
        instance = get_object_or_404(self.model, pk=pk)
        related_instances = Location.objects.get_level_parents(instance, level_id)
        serializer = self._all_related_serializer(related_instances, many=True)
        return Response(serializer.data)


# class CoalesceFilterBackend(filters.backends.DjangoFilterBackend):

#     """
#     Support Ember Data coalesceFindRequests.

#     """
#     def filter_queryset(self, request, queryset, view):
#         id_list = request.QUERY_PARAMS.getlist('ids[]')
#         if id_list:
#             queryset = queryset.filter(id__in=id_list)
#         return queryset
    

# class LocationFilter(filters.FilterSet):
    
#     state = filters.CharFilter(name='addresses__state')
    
#     class Meta:
#         model = Location
#         fields = ['number', 'name', 'level', 'status', 'type', 'state', 
#                   'children', 'children__type']
#         order_by = ['number', 'name', '-number', '-name', 'level', '-level',
#                     'status', '-status', 'type', '-type', 'addresses__state', 
#                     '-addresses__state', 'children__name', '-children__name']


### LocationViewSet other code =>

    # filter_class = LocationFilter
    
    # def get_queryset(self):
    #     queryset = self.queryset
    #     '''
    #     local version of coalesce
    #     '''
    #     id_list = self.request.QUERY_PARAMS.getlist('ids[]')
    #     if id_list:
    #         queryset = queryset.filter(id__in=id_list)
    #     '''
    #     get related locations of parent_loc...
    #     when used with level filter can get direct children or parents
    #     todo: use level to get list from any level through childrenhips
    #     todo: move this to a detail route for the parent e.g. /locations/6/children?level=2
    #     '''
    #     parent_loc_id = self.request.QUERY_PARAMS.get('parent_loc')
    #     if parent_loc_id:
    #         parent_loc = Location.objects.get(id=parent_loc_id)
    #         if parent_loc:
    #             queryset = queryset.filter(children=parent_loc)
    #     return queryset


    # @detail_route(methods=['get'])
    # def children(self, request, pk):
    #     '''
    #     Get locations that are related and at the specified level
    #     '''
    #     respObj = {}
    #     locs = []
        
    #     if request.method == 'GET':
    #         if not request.query_params.has_key('level'):
    #             #no level specified
    #             respObj['code'] = 400
    #             respObj['message'] = 'no level specified'
    #             return Response(respObj, status=status.HTTP_400_BAD_REQUEST)
    #         else:
    #             level_id = request.query_params['level']
    #             level = LocationLevel.objects.filter(id=level_id)
    #             if level.count() != 1:
    #                 respObj['code'] = 400
    #                 respObj['message'] = 'level id ' + level_id + ' does not exist'
    #                 return Response(respObj, status=status.HTTP_400_BAD_REQUEST)
                
    #             locs = Location.objects.filter(id=pk)
    #             if locs.count() != 1:
    #                 respObj['code'] = 400
    #                 respObj['message'] = 'location ' + pk + ' does not exist'
    #                 return Response(respObj, status=status.HTTP_400_BAD_REQUEST)
                
    #             # build the query based on levels
    #             # recurse through children until at least one is found with the right level
    #             respObj['code'] = 400
    #             respObj['message'] = 'no children for level id ' + level_id + ' found'
    #             return Response(respObj, status=status.HTTP_400_BAD_REQUEST)

            
    #     else:
    #         respObj['code'] = 400
    #         respObj['message'] = 'Method not supported - ' + request.method
    #         return Response(respObj, status=status.HTTP_400_BAD_REQUEST)
    #     