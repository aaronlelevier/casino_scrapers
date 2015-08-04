'''
Big Sky Retail Systems Framework
Location views

Created on Jan 21, 2015

@author: tkrier

'''
from rest_framework import viewsets
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import detail_route
from rest_framework.exceptions import MethodNotAllowed

import rest_framework_filters as filters

from location.models import Location, LocationLevel, LocationStatus, LocationType
from location import serializers as ls


class LocationLevelViewSet(viewsets.ModelViewSet):

    permission_classes = (IsAuthenticated,)
    queryset = LocationLevel.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ls.LocationLevelSerializer
        elif self.action == 'retrieve':
            return ls.LocationLevelDetailSerializer
        elif self.action in ('create', 'update'):
            return ls.LocationLevelCreateSerializer
        else:
            raise MethodNotAllowed(method=self.action)
    

class LocationStatusViewSet(viewsets.ModelViewSet):

    permission_classes = (IsAuthenticated,)
    serializer_class = ls.LocationStatusSerializer
    queryset = LocationStatus.objects.all()


class LocationTypeViewSet(viewsets.ModelViewSet):

    permission_classes = (IsAuthenticated,)
    serializer_class = ls.LocationTypeSerializer
    queryset = LocationType.objects.all()


class LocationViewSet(viewsets.ModelViewSet):
   
    permission_classes = (IsAuthenticated,)
    queryset = Location.objects.all()
    
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