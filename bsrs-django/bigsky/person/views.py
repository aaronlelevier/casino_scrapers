import copy

from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission, User
from django.shortcuts import get_object_or_404

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import detail_route
from rest_framework.utils.serializer_helpers import ReturnDict

from person import helpers, serializers as ps
from person.models import Person, PersonStatus, Role
from util.permissions import BSModelPermissions
from util.views import BaseModelViewSet


class RoleViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows roles to be viewed or edited.
    """
    queryset = Role.objects.all()
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_class(self):
        """
        set the serializer based on the method
        """
        if self.action == 'retrieve':
            return ps.RoleSerializer
        elif self.action == ('update' or 'partial_update'):
            return ps.RoleCreateSerializer
        elif self.action == 'create':
            return ps.RoleCreateSerializer
        else:
            return ps.RoleSerializer


class PersonStatusViewSet(viewsets.ModelViewSet):

    queryset = PersonStatus.objects.all()
    serializer_class = ps.PersonStatusSerializer
    permission_classes = (permissions.IsAuthenticated,)


class PersonViewSet(BaseModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    
    includes model level permissions, not user level yet
    """
    queryset = Person.objects.all()
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_class(self):
        """
        set the serializer based on the method
        """
        if self.action == 'retrieve':
            return ps.PersonDetailSerializer
        elif self.action == ('update' or 'partial_update'):
            return ps.PersonUpdateSerializer
        elif self.action == 'create':
            return ps.PersonCreateSerializer
        else:
            return ps.PersonListSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            # Add ``auth_amount`` to dict
            serializer = helpers.update_auth_amount(serializer)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        # Add ``auth_amount`` to dict
        serializer = helpers.update_auth_amount(serializer)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        # TODO: need to return ``serializer.data``, but won't let me override .data attr
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        print serializer.data
        # Add ``auth_amount`` to dict
        data = copy.copy(serializer.data)
        helpers.update_auth_amount_single(data)
        # setattr(serializer, 'data', ReturnDict(data, serializer=serializer))
        return Response(data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        # custom: start
        auth_amount = serializer.initial_data.pop("auth_amount", {})
        serializer.initial_data.update({
            "auth_amount": auth_amount.get("amount",""),
            "auth_amount_currency": auth_amount.get("currency","")
        })
        # custom: end
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        # Add ``auth_amount`` to dict
        data = copy.copy(serializer.data)
        helpers.update_auth_amount_single(data)
        return Response(data)

'''
"auth_amount": {
    "amount": 1000.1234,
    "currency": "f8716abf-65f1-4d85-ac8c-55afffb2f7dd"
},
'''


### TODO: ###
    # @detail_route(methods=['post'])
    # def change_password(self, request, pk):

    # @detail_route(methods=['get'])
    # def perms(self, request, pk):
    #     '''
    #     Get permissions for the current user and a model. Permissions must be set on a role.
    #     '''
    #     respObj = {}
    #     perms = {}
        
    #     if request.method == 'GET':
    #         user = self.get_object()
    #         if not request.query_params.has_key('model'):
    #             # no model specified
    #             respObj['code'] = 400
    #             respObj['message'] = 'Please specify a model'
    #             return Response(respObj, status=status.HTTP_400_BAD_REQUEST)
    #         else:
    #             model = request.query_params['model']
    #             ctype = ContentType.objects.filter(model=model)
    #             if ctype.count() == 0:
    #                 respObj['code'] = 400
    #                 respObj['message'] = 'Model (' + model + ') is not valid'
    #                 return Response(respObj, status=status.HTTP_400_BAD_REQUEST)
                    
    #             perms = self._getPersonPerms(user, model)
    #             return Response(perms)
    #     else:
    #         # should never get here
    #         respObj['code'] = 400
    #         respObj['message'] = 'Method not supported - ' + request.method
    #         return Response(respObj, status=status.HTTP_400_BAD_REQUEST)

    # def _getPersonPerms(self, person, model):
    #     '''
    #     Helper function to get the current permissions of the user
    #     '''
    #     perms = {}

    #     ctype = ContentType.objects.filter(model=model)
    #     availPerms = Permission.objects.filter(content_type=ctype)
            
    #     for aperm in availPerms:
    #         perms[aperm.codename] = False
    #         if person.has_perm('person.' + aperm.codename):
    #             perms[aperm.codename] = True
                                
    #     return perms


### ROLE ###

    # @detail_route(methods=['get', 'put'])
    # def perms(self, request, pk):
    #     '''
    #     get or set permissions for a role and a model
        
    #     e.g. /roles/1/perms/?model=location
        
    #     returns object with all available permissions for that model set to true or false
        
    #     '''
    #     respObj = {}
    #     perms = {}
        
    #     if request.method == 'GET':
    #         role = self.get_object()
    #         if not request.query_params.has_key('model'):
    #             #no model specified
    #             respObj['code'] = 400
    #             respObj['message'] = 'Please specify a model'
    #             return Response(respObj, status=status.HTTP_400_BAD_REQUEST)
    #         else:
    #             model = request.query_params['model']
    #             ctype = ContentType.objects.filter(model=model)
    #             if ctype.count() == 0:
    #                 respObj['code'] = 400
    #                 respObj['message'] = 'Model (' + model + ') is not valid'
    #                 return Response(respObj, status=status.HTTP_400_BAD_REQUEST)
                    
    #             perms = self._getRolePerms(role, model)
    #             return Response(perms)
                            
    #     elif request.method == 'PUT':
    #         role = self.get_object()
    #         if not request.query_params.has_key('model'):
    #             #no model specified
    #             respObj['code'] = 400
    #             respObj['message'] = 'Please specify a model'
    #             return Response(respObj, status=status.HTTP_400_BAD_REQUEST)
            
    #         else:
    #             model = request.query_params['model']
    #             ctype = ContentType.objects.filter(model=model)
    #             if ctype.count() == 0:
    #                 respObj['code'] = 400
    #                 respObj['message'] = 'Model (' + model + ') is not valid'
    #                 return Response(respObj, status=status.HTTP_400_BAD_REQUEST)

    #             permobj = request.DATA
    #             for perm, value in permobj.items():
    #                 rperm = role.group.permissions.filter(codename=perm)
    #                 aperm = Permission.objects.filter(codename=perm)
    #                 if aperm.count() > 0:
    #                     aperm = aperm[0]
                    
    #                     if value == True:
    #                         if not rperm:
    #                             role.group.permissions.add(aperm)
                                
    #                     if value == False:
    #                         if rperm:
    #                             role.group.permissions.remove(aperm)
                                
    #                 else:
    #                     respObj['code'] = 400
    #                     respObj['message'] = 'Permission does not exist - ' + perm
    #                     return Response(respObj, status=status.HTTP_400_BAD_REQUEST)
                
    #             perms = self._getRolePerms(role, model)    
    #             return Response(perms)
        
    #     else:
    #         respObj['code'] = 400
    #         respObj['message'] = 'Method not supported - ' + request.method
    #         return Response(respObj, status=status.HTTP_400_BAD_REQUEST)


    # def _getRolePerms(self, role, model):
    #     '''
    #     Helper function to get the current permissions
    #     '''
    #     perms = {}

    #     ctype = ContentType.objects.filter(model=model)
    #     rolePerms = role.group.permissions.filter(content_type=ctype)
    #     availPerms = Permission.objects.filter(content_type=ctype)
            
    #     for aperm in availPerms:
    #         perms[aperm.codename] = False
    #         for rperm in rolePerms:
    #             if rperm.id == aperm.id:
    #                 perms[aperm.codename] = True
    #                 break            
                                
    #     return perms
