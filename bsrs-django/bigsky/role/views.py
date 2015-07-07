'''
Created on Jun 22, 2015

@author: tkrier
'''
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import detail_route
from rest_framework import status

from bsrsadmin.permissions import BSModelPermissions
import serializers as roleSerializers
import models as roleModels

class RoleViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows roles to be viewed or edited.
    """
    permission_classes = [BSModelPermissions]
    queryset = roleModels.Role.objects.all()
    serializer_class = roleSerializers.RoleSerializer

    @detail_route(methods=['get', 'put'])
    def perms(self, request, pk):
        '''
        get or set permissions for a role and a model
        
        e.g. /roles/1/perms/?model=location
        
        returns object with all available permissions for that model set to true or false
        
        '''
        respObj = {}
        perms = {}
        
        if request.method == 'GET':
            role = self.get_object()
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
                    
                perms = self._getRolePerms(role, model)
                return Response(perms)
                            
        elif request.method == 'PUT':
            role = self.get_object()
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

                permobj = request.DATA
                for perm, value in permobj.items():
                    rperm = role.permissions.filter(codename=perm)
                    aperm = Permission.objects.filter(codename=perm)
                    if aperm.count() > 0:
                        aperm = aperm[0]
                    
                        if value == True:
                            if not rperm:
                                role.permissions.add(aperm)
                                
                        if value == False:
                            if rperm:
                                role.permissions.remove(aperm)
                                
                    else:
                        respObj['code'] = 400
                        respObj['message'] = 'Permission does not exist - ' + perm
                        return Response(respObj, status=status.HTTP_400_BAD_REQUEST)
                
                perms = self._getRolePerms(role, model)    
                return Response(perms)
        
        else:
#             should never get here
            respObj['code'] = 400
            respObj['message'] = 'Method not supported - ' + request.method
            return Response(respObj, status=status.HTTP_400_BAD_REQUEST)


    def _getRolePerms(self, role, model):
        '''
        Helper function to get the current permissions
        '''
        perms = {}

        ctype = ContentType.objects.filter(name=model)
        rolePerms = role.permissions.filter(content_type=ctype)
        availPerms = Permission.objects.filter(content_type=ctype)
            
        for aperm in availPerms:
            perms[aperm.codename] = False
            for rperm in rolePerms:
                if rperm.id == aperm.id:
                    perms[aperm.codename] = True
                    break            
                                
        return perms
    