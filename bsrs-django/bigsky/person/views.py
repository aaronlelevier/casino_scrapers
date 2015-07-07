'''
Created on Jan 16, 2015

@author: tkrier
'''
# from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission

from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import detail_route
from rest_framework import status

import serializers as personSerializers
import models as personModels
from permissions import BSModelPermissions

class PersonStatusViewSet(viewsets.ModelViewSet):

    permission_classes = [BSModelPermissions]
    queryset = personModels.PersonStatus.objects.all()
    serializer_class = personSerializers.PersonStatusSerializer


class PersonViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    
    includes model level permissions, not user level yet
    """
    permission_classes = (permissions.IsAuthenticated,)
    queryset = personModels.Person.objects.all()
    
    def get_serializer_class(self):
        """
        set the serializer based on the method
        """
        if (self.action == 'retrieve'):
            self.serializer_class = personSerializers.PersonFullSerializer
        elif (self.action == 'list'):
            self.serializer_class = personSerializers.PersonListSerializer
        else:
            self.serializer_class = personSerializers.PersonSerializer
        return self.serializer_class
    
    @detail_route(methods=['get'])
    def perms(self, request, pk):
        '''
        Get permissions for the current user and a model. Permissions must be set on a role.
        '''
        respObj = {}
        perms = {}
        
        if request.method == 'GET':
            user = self.get_object()
            if not request.query_params.has_key('model'):
                #no model specified
                respObj['code'] = 400
                respObj['message'] = 'Please specify a model'
                return Response(respObj, status=status.HTTP_400_BAD_REQUEST)
            else:
                model = request.query_params['model']
                ctype = ContentType.objects.filter(name=model)
                if ctype.count() == 0:
                    respObj['code'] = 400
                    respObj['message'] = 'Model (' + model + ') is not valid'
                    return Response(respObj, status=status.HTTP_400_BAD_REQUEST)
                    
                perms = self._getPersonPerms(user, model)
                return Response(perms)
        else:
#             should never get here
            respObj['code'] = 400
            respObj['message'] = 'Method not supported - ' + request.method
            return Response(respObj, status=status.HTTP_400_BAD_REQUEST)

    def _getPersonPerms(self, person, model):
        '''
        Helper function to get the current permissions of the user
        '''
        perms = {}

        ctype = ContentType.objects.filter(name=model)
#         userPerms = user.user_permissions.filter(content_type=ctype)
        availPerms = Permission.objects.filter(content_type=ctype)
            
        for aperm in availPerms:
            perms[aperm.codename] = False
            if person.has_perm('person.' + aperm.codename):
                perms[aperm.codename] = True
                
#             for uperm in userPerms:
#                 if uperm.id == aperm.id:
#                     perms[aperm.codename] = True
#                     break            
                                
        return perms

