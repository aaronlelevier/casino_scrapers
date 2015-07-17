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

import rest_framework_filters as filters

from location.models import Location, LocationLevel, LocationStatus, LocationType
from location.serializers import (
    LocationLevelSerializer, LocationStatusSerializer, LocationTypeSerializer,
    LocationSerializer, LocationGridSerializer, LocationFullSerializer
    )    


class CoalesceFilterBackend(filters.backends.DjangoFilterBackend):

    """
    Support Ember Data coalesceFindRequests.

    """
    def filter_queryset(self, request, queryset, view):
        id_list = request.QUERY_PARAMS.getlist('ids[]')
        if id_list:
            queryset = queryset.filter(id__in=id_list)
        return queryset
    

class LocationFilter(filters.FilterSet):
    
    state = filters.CharFilter(name='addresses__state')
    
    class Meta:
        model = Location
        fields = ['number', 'name', 'level', 'status', 'type', 'state', 
                  'relations', 'relations__type']
        order_by = ['number', 'name', '-number', '-name', 'level', '-level',
                    'status', '-status', 'type', '-type', 'addresses__state', 
                    '-addresses__state', 'relations__name', '-relations__name']
        

class LocationLevelViewSet(viewsets.ModelViewSet):

    permission_classes = (IsAuthenticated,)
    serializer_class = LocationLevelSerializer
    queryset = LocationLevel.objects.all()
    

class LocationStatusViewSet(viewsets.ModelViewSet):

    permission_classes = (IsAuthenticated,)
    serializer_class = LocationStatusSerializer
    queryset = LocationStatus.objects.all()


class LocationTypeViewSet(viewsets.ModelViewSet):

    permission_classes = (IsAuthenticated,)
    serializer_class = LocationTypeSerializer
    queryset = LocationType.objects.all()
    
    
class LocationViewSet(viewsets.ModelViewSet):
   
    permission_classes = (IsAuthenticated,)
    queryset = Location.objects.all()
    filter_class = LocationFilter
    
    def get_queryset(self):
        queryset = self.queryset
        '''
        local version of coalesce
        '''
        id_list = self.request.QUERY_PARAMS.getlist('ids[]')
        if id_list:
            queryset = queryset.filter(id__in=id_list)
        '''
        get related locations of parent_loc...
        when used with level filter can get direct children or parents
        todo: use level to get list from any level through relationships
        todo: move this to a detail route for the parent e.g. /locations/6/relations?level=2
        '''
        parent_loc_id = self.request.QUERY_PARAMS.get('parent_loc')
        if parent_loc_id:
            parent_loc = Location.objects.get(id=parent_loc_id)
            if parent_loc:
                queryset = queryset.filter(relations=parent_loc)

        return queryset
    
    def get_serializer_class(self):
        """
        set the serializer based on the method
        """
        if (self.action == 'retrieve'):
            self.serializer_class = LocationFullSerializer
        elif (self.action == 'list'):
            self.serializer_class = LocationGridSerializer
        else:
            self.serializer_class = LocationSerializer

        return self.serializer_class

    @detail_route(methods=['get'])
    def relations(self, request, pk):
        '''
        Get locations that are related and at the specified level
        '''
        respObj = {}
        locs = []
        
        if request.method == 'GET':
            if not request.query_params.has_key('level'):
                #no level specified
                respObj['code'] = 400
                respObj['message'] = 'no level specified'
                return Response(respObj, status=status.HTTP_400_BAD_REQUEST)
            else:
                level_id = request.query_params['level']
                level = LocationLevel.objects.filter(id=level_id)
                if level.count() != 1:
                    respObj['code'] = 400
                    respObj['message'] = 'level id ' + level_id + ' does not exist'
                    return Response(respObj, status=status.HTTP_400_BAD_REQUEST)
                
                locs = Location.objects.filter(id=pk)
                if locs.count() != 1:
                    respObj['code'] = 400
                    respObj['message'] = 'location ' + pk + ' does not exist'
                    return Response(respObj, status=status.HTTP_400_BAD_REQUEST)
                
                # build the query based on levels
                # recurse through relations until at least one is found with the right level
                respObj['code'] = 400
                respObj['message'] = 'no relations for level id ' + level_id + ' found'
                return Response(respObj, status=status.HTTP_400_BAD_REQUEST)

            
        else:
            respObj['code'] = 400
            respObj['message'] = 'Method not supported - ' + request.method
            return Response(respObj, status=status.HTTP_400_BAD_REQUEST)
        