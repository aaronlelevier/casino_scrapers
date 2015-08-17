from django.db.models.functions import Lower

from rest_framework import permissions, filters
import rest_framework_filters as filters

from person import helpers, serializers as ps
from person.models import Person, PersonStatus, Role
from util.views import BaseModelViewSet


class RoleViewSet(BaseModelViewSet):
    """
    API endpoint that allows roles to be viewed or edited.
    """
    queryset = Role.objects.all()
    serializer_class = ps.RoleSerializer
    permission_classes = (permissions.IsAuthenticated,)


class PersonStatusViewSet(BaseModelViewSet):
    queryset = PersonStatus.objects.all()
    serializer_class = ps.PersonStatusSerializer
    permission_classes = (permissions.IsAuthenticated,)


### PERSON

class PersonFilterSet(filters.FilterSet):
    first_name = filters.AllLookupsFilter(name='first_name')
    username = filters.AllLookupsFilter(name='username')
    
    class Meta:
        model= Person
        fields = ['first_name', 'username']


class PersonViewSet(BaseModelViewSet):
    queryset = Person.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    filter_class = PersonFilterSet

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

    def get_queryset(self):
        queryset = self.queryset
        ordering = self.request.query_params.get('ordering', None)
        if ordering:
            if ordering.startswith('-'):
                queryset = queryset.order_by(Lower(ordering[1:])).reverse()
            else:
                queryset = queryset.order_by(Lower(ordering))
        return queryset

    ### TODO:
    ### Change Password logic --------------------------------------------------------------------------

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
